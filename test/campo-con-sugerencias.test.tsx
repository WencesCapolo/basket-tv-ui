import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { CampoConSugerencias } from '../src/campo-con-sugerencias';

beforeAll(() => {
  // jsdom has no layout: the list scrolls the active option into view.
  Element.prototype.scrollIntoView = () => {};
});

afterEach(cleanup);

const LIGAS = ['Liga Nacional', 'Liga Argentina', 'Liga Femenina', 'Liga Próximo'];

function Controlado({ alCambiar = () => {} }: { alCambiar?: (v: string) => void }) {
  const [valor, setValor] = useState('');
  return (
    <CampoConSugerencias
      aria-label="Liga"
      sugerencias={LIGAS}
      value={valor}
      onChange={(e) => {
        setValor(e.target.value);
        alCambiar(e.target.value);
      }}
    />
  );
}

const campo = () => screen.getByRole('combobox', { name: 'Liga' }) as HTMLInputElement;
const opciones = () => screen.queryAllByRole('option').map((o) => o.textContent);

describe('CampoConSugerencias', () => {
  it('offers the suggestions that contain what was typed, ignoring accents and case', async () => {
    render(<Controlado />);
    const usuario = userEvent.setup();
    await usuario.click(campo());
    expect(opciones()).toEqual(LIGAS);
    await usuario.type(campo(), 'PROXI');
    expect(opciones()).toEqual(['Liga Próximo']);
  });

  it('chooses one with a click: onChange gets it and the list closes', async () => {
    const alCambiar = vi.fn();
    render(<Controlado alCambiar={alCambiar} />);
    const usuario = userEvent.setup();
    await usuario.type(campo(), 'fem');
    await usuario.click(screen.getByRole('option', { name: 'Liga Femenina' }));
    expect(alCambiar).toHaveBeenLastCalledWith('Liga Femenina');
    expect(campo().value).toBe('Liga Femenina');
    expect(opciones()).toEqual([]);
  });

  it('chooses with the arrows and Enter without submitting the form, and keeps free text', async () => {
    const enviar = vi.fn((e: { preventDefault(): void }) => e.preventDefault());
    render(
      <form onSubmit={enviar}>
        <Controlado />
      </form>,
    );
    const usuario = userEvent.setup();
    await usuario.type(campo(), 'liga a');
    await usuario.keyboard('{ArrowDown}{Enter}');
    expect(campo().value).toBe('Liga Argentina');
    expect(enviar).not.toHaveBeenCalled();

    await usuario.clear(campo());
    await usuario.type(campo(), 'Copa propia{Escape}');
    expect(campo().value).toBe('Copa propia');
  });
});
