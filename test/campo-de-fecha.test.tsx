import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CampoDeFecha } from '../src/campo-de-fecha';

afterEach(cleanup);

function Controlado({ inicial = '2026-03-10', alCambiar = () => {}, ...props }: { inicial?: string; alCambiar?: (v: string) => void; min?: string; max?: string; required?: boolean }) {
  const [valor, setValor] = useState(inicial);
  return (
    <CampoDeFecha
      aria-label="Fecha"
      value={valor}
      onChange={(e) => {
        setValor(e.target.value);
        alCambiar(e.target.value);
      }}
      {...props}
    />
  );
}

const campo = () => screen.getByRole('combobox', { name: 'Fecha' });
const dia = (n: number) => screen.getAllByRole('gridcell').find((c) => c.textContent === String(n))!;

describe('CampoDeFecha', () => {
  it('shows the date as dd/mm/aaaa and opens on its month, Monday first', async () => {
    render(<Controlado />);
    expect(campo().textContent).toBe('10/03/2026');
    await userEvent.setup().click(campo());
    expect(screen.getByRole('grid', { name: 'Marzo 2026' })).toBeTruthy();
    expect(screen.getAllByRole('columnheader')[0]!.textContent).toBe('lu');
    expect(dia(10).getAttribute('aria-selected')).toBe('true');
  });

  it('chooses a day with a click and fires onChange with AAAA-MM-DD, closed and back on the field', async () => {
    const alCambiar = vi.fn();
    render(<Controlado alCambiar={alCambiar} />);
    const usuario = userEvent.setup();
    await usuario.click(campo());
    await usuario.click(dia(21));
    expect(alCambiar).toHaveBeenCalledWith('2026-03-21');
    expect(campo().textContent).toBe('21/03/2026');
    expect(screen.queryByRole('grid')).toBeNull();
    expect(document.activeElement).toBe(campo());
  });

  it('moves with the keyboard across months and chooses with Enter', async () => {
    const alCambiar = vi.fn();
    render(<Controlado inicial="2026-03-30" alCambiar={alCambiar} />);
    const usuario = userEvent.setup();
    campo().focus();
    await usuario.keyboard('{ArrowDown}{ArrowDown}{ArrowRight}{PageDown}{Enter}');
    expect(alCambiar).toHaveBeenCalledWith('2026-05-07');
  });

  it('does not choose a day outside min and max, nor move to it', async () => {
    const alCambiar = vi.fn();
    render(<Controlado inicial="2026-03-10" min="2026-03-05" max="2026-03-12" alCambiar={alCambiar} />);
    const usuario = userEvent.setup();
    await usuario.click(campo());
    expect(dia(4).getAttribute('aria-disabled')).toBe('true');
    await usuario.click(dia(20));
    expect(alCambiar).not.toHaveBeenCalled();
    await usuario.keyboard('{ArrowDown}{Enter}');
    expect(alCambiar).toHaveBeenCalledWith('2026-03-12');
  });

  it('clears an optional date with Borrar; a required one has no Borrar and stops the form while empty', async () => {
    const alCambiar = vi.fn();
    const { unmount } = render(<Controlado alCambiar={alCambiar} />);
    const usuario = userEvent.setup();
    await usuario.click(campo());
    await usuario.click(screen.getByRole('button', { name: 'Borrar' }));
    expect(alCambiar).toHaveBeenCalledWith('');
    expect(campo().textContent).toBe('dd/mm/aaaa');
    unmount();

    render(
      <form aria-label="f">
        <Controlado inicial="" required />
      </form>,
    );
    await usuario.click(campo());
    expect(screen.queryByRole('button', { name: 'Borrar' })).toBeNull();
    expect((screen.getByRole('form') as HTMLFormElement).checkValidity()).toBe(false);
  });
});
