import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CampoDeMes } from '../src/campo-de-mes';

afterEach(cleanup);

function Controlado({ inicial = '2026-08', alCambiar = () => {}, ...props }: { inicial?: string; alCambiar?: (v: string) => void; min?: string; max?: string; required?: boolean }) {
  const [valor, setValor] = useState(inicial);
  return (
    <CampoDeMes
      aria-label="Mes"
      value={valor}
      onChange={(e) => {
        setValor(e.target.value);
        alCambiar(e.target.value);
      }}
      {...props}
    />
  );
}

const campo = () => screen.getByRole('combobox', { name: 'Mes' });
const mes = (nombre: string) => screen.getByRole('gridcell', { name: nombre });

describe('CampoDeMes', () => {
  it('shows the month in Spanish and opens on its year with the twelve months', async () => {
    render(<Controlado />);
    expect(campo().textContent).toBe('Agosto 2026');
    await userEvent.setup().click(campo());
    expect(screen.getByRole('grid', { name: '2026' })).toBeTruthy();
    expect(screen.getAllByRole('gridcell')).toHaveLength(12);
    expect(mes('Agosto 2026').getAttribute('aria-selected')).toBe('true');
  });

  it('chooses a month with a click and fires onChange with AAAA-MM, closed and back on the field', async () => {
    const alCambiar = vi.fn();
    render(<Controlado alCambiar={alCambiar} />);
    const usuario = userEvent.setup();
    await usuario.click(campo());
    await usuario.click(mes('Febrero 2026'));
    expect(alCambiar).toHaveBeenCalledWith('2026-02');
    expect(campo().textContent).toBe('Febrero 2026');
    expect(screen.queryByRole('grid')).toBeNull();
    expect(document.activeElement).toBe(campo());
  });

  it('changes the year with the arrows and with the keyboard', async () => {
    const alCambiar = vi.fn();
    render(<Controlado inicial="2026-11" alCambiar={alCambiar} />);
    const usuario = userEvent.setup();
    await usuario.click(campo());
    await usuario.click(screen.getByRole('button', { name: 'Año anterior' }));
    await usuario.click(mes('Marzo 2025'));
    expect(alCambiar).toHaveBeenLastCalledWith('2025-03');

    campo().focus();
    await usuario.keyboard('{ArrowDown}{ArrowRight}{ArrowDown}{PageDown}{PageDown}{Enter}');
    expect(alCambiar).toHaveBeenLastCalledWith('2027-07');
  });

  it('does not choose a month outside min and max, nor go to a year without any', async () => {
    const alCambiar = vi.fn();
    render(<Controlado inicial="2026-03" min="2026-02" max="2026-11" alCambiar={alCambiar} />);
    const usuario = userEvent.setup();
    await usuario.click(campo());
    expect(mes('Enero 2026').getAttribute('aria-disabled')).toBe('true');
    expect(mes('Diciembre 2026').getAttribute('aria-disabled')).toBe('true');
    expect(screen.getByRole('button', { name: 'Año anterior' }).hasAttribute('disabled')).toBe(true);
    expect(screen.getByRole('button', { name: 'Año siguiente' }).hasAttribute('disabled')).toBe(true);
    await usuario.click(mes('Diciembre 2026'));
    expect(alCambiar).not.toHaveBeenCalled();
    await usuario.keyboard('{PageDown}{Enter}');
    expect(alCambiar).toHaveBeenCalledWith('2026-11');
  });

  it('clears an optional month with Borrar; a required one has no Borrar and stops the form while empty', async () => {
    const alCambiar = vi.fn();
    const { unmount } = render(<Controlado alCambiar={alCambiar} />);
    const usuario = userEvent.setup();
    await usuario.click(campo());
    await usuario.click(screen.getByRole('button', { name: 'Borrar' }));
    expect(alCambiar).toHaveBeenCalledWith('');
    expect(campo().textContent).toBe('Mes y año');
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
