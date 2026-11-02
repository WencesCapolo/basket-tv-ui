import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Selector, type OpcionDeSelector, type PropsDelSelector } from '../src/selector';

const PERIODOS: readonly OpcionDeSelector[] = [
  { valor: '2026-08', etiqueta: 'Agosto 2026' },
  { valor: '2026-09', etiqueta: 'Septiembre 2026', deshabilitada: true },
  { valor: '2026-10', etiqueta: 'Octubre 2026' },
  { valor: '2026-11', etiqueta: 'Noviembre 2026' },
];

function Controlado({ inicial = '', alCambiar = () => {}, ...props }: Partial<PropsDelSelector> & { inicial?: string; alCambiar?: (valor: string) => void }) {
  const [valor, setValor] = useState(inicial);
  return (
    <Selector
      aria-label="Período"
      opciones={PERIODOS}
      placeholder="Todos los períodos"
      {...props}
      valor={valor}
      onCambiar={(nuevo) => {
        setValor(nuevo);
        alCambiar(nuevo);
      }}
    />
  );
}

function simularPuntero(grueso: boolean) {
  vi.stubGlobal(
    'matchMedia',
    (consulta: string) =>
      ({
        matches: grueso && consulta === '(pointer: coarse)',
        media: consulta,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  );
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('Selector con mouse', () => {
  it('abre con un clic su propia lista y elige una opción', async () => {
    const alCambiar = vi.fn();
    simularPuntero(false);
    render(<Controlado alCambiar={alCambiar} />);

    const control = screen.getByRole('combobox', { name: 'Período' });
    expect(control.textContent).toBe('Todos los períodos');
    expect(document.querySelector('select')).toBeNull();

    await userEvent.click(control);
    expect(control.getAttribute('aria-expanded')).toBe('true');
    const lista = screen.getByRole('listbox', { name: 'Período' });
    expect(lista.id).toBe(control.getAttribute('aria-controls'));
    expect(lista.parentElement).toBe(document.body);
    expect(screen.getByRole('option', { name: 'Todos los períodos' }).getAttribute('aria-selected')).toBe('true');

    await userEvent.click(screen.getByRole('option', { name: 'Octubre 2026' }));

    expect(alCambiar).toHaveBeenCalledWith('2026-10');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(control.textContent).toBe('Octubre 2026');
    expect(document.activeElement).toBe(control);
  });

  it('no elige una opción deshabilitada', async () => {
    const alCambiar = vi.fn();
    render(<Controlado alCambiar={alCambiar} />);

    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('option', { name: 'Septiembre 2026' }));

    expect(alCambiar).not.toHaveBeenCalled();
    expect(screen.getByRole('listbox')).toBeTruthy();
  });

  it('se cierra tocando afuera, sin elegir', async () => {
    const alCambiar = vi.fn();
    render(
      <>
        <p>Afuera</p>
        <Controlado alCambiar={alCambiar} />
      </>,
    );

    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByText('Afuera'));

    expect(screen.queryByRole('listbox')).toBeNull();
    expect(alCambiar).not.toHaveBeenCalled();
  });
});

describe('Selector con teclado', () => {
  it('se mueve con las flechas, salta las deshabilitadas y elige con Enter', async () => {
    const alCambiar = vi.fn();
    render(<Controlado alCambiar={alCambiar} />);
    const control = screen.getByRole('combobox');
    const activa = () => document.getElementById(control.getAttribute('aria-activedescendant') ?? '')?.textContent;

    control.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(control.getAttribute('aria-expanded')).toBe('true');
    expect(activa()).toBe('Todos los períodos');

    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    expect(activa()).toBe('Octubre 2026');

    await userEvent.keyboard('{End}');
    expect(activa()).toBe('Noviembre 2026');
    await userEvent.keyboard('{ArrowDown}');
    expect(activa()).toBe('Noviembre 2026');

    await userEvent.keyboard('{Home}{ArrowDown}{Enter}');
    expect(alCambiar).toHaveBeenLastCalledWith('2026-08');
    expect(control.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(control);
  });

  it('abre con Space en la opción elegida y elige con Space', async () => {
    const alCambiar = vi.fn();
    render(<Controlado inicial="2026-10" alCambiar={alCambiar} />);
    const control = screen.getByRole('combobox');

    control.focus();
    await userEvent.keyboard(' ');
    expect(document.getElementById(control.getAttribute('aria-activedescendant')!)?.textContent).toBe('Octubre 2026');

    await userEvent.keyboard('{ArrowDown} ');
    expect(alCambiar).toHaveBeenCalledWith('2026-11');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('Escape cierra, devuelve el foco y no llega al document', async () => {
    const alDocument = vi.fn();
    document.addEventListener('keydown', alDocument);
    render(<Controlado />);
    const control = screen.getByRole('combobox');

    await userEvent.click(control);
    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('listbox')).toBeNull();
    expect(document.activeElement).toBe(control);
    expect(alDocument).not.toHaveBeenCalled();
    document.removeEventListener('keydown', alDocument);
  });

  it('Tab cierra sin elegir y sigue al próximo control', async () => {
    const alCambiar = vi.fn();
    render(
      <>
        <Controlado alCambiar={alCambiar} />
        <button type="button">Siguiente</button>
      </>,
    );

    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.tab();

    expect(screen.queryByRole('listbox')).toBeNull();
    expect(alCambiar).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Siguiente' }));
  });

  it('busca por las primeras letras, sin acentos y recorriendo con la misma letra', async () => {
    render(
      <Controlado
        opciones={[
          { valor: 'a', etiqueta: 'Árbitro' },
          { valor: 'b', etiqueta: 'Anotador' },
          { valor: 'c', etiqueta: 'Asistente' },
        ]}
        placeholder={undefined}
        inicial="a"
      />,
    );
    const control = screen.getByRole('combobox');
    const activa = () => document.getElementById(control.getAttribute('aria-activedescendant') ?? '')?.textContent;

    control.focus();
    await userEvent.keyboard('a');
    expect(activa()).toBe('Anotador');
    await userEvent.keyboard('a');
    expect(activa()).toBe('Asistente');
    await userEvent.keyboard('a');
    expect(activa()).toBe('Árbitro');
  });

  it('deshabilitado no abre', async () => {
    render(<Controlado deshabilitado />);
    const control = screen.getByRole('combobox');

    await userEvent.click(control);

    expect((control as HTMLButtonElement).disabled).toBe(true);
    expect(screen.queryByRole('listbox')).toBeNull();
  });
});

describe('Selector en un formulario', () => {
  it('envía su valor con name', async () => {
    render(
      <form data-testid="formulario">
        <Controlado name="periodo" inicial="2026-08" />
      </form>,
    );

    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('option', { name: 'Noviembre 2026' }));

    const datos = new FormData(screen.getByTestId('formulario') as HTMLFormElement);
    expect(datos.get('periodo')).toBe('2026-11');
  });

  it('se nombra con su label y marca el inválido', () => {
    render(
      <>
        <label htmlFor="estado">Estado</label>
        <Selector id="estado" valor="" onCambiar={() => {}} opciones={PERIODOS} invalido />
      </>,
    );

    const control = screen.getByRole('combobox', { name: 'Estado' });
    expect(control.getAttribute('aria-invalid')).toBe('true');
  });
});

describe('Selector con el dedo', () => {
  it('usa el <select> nativo, con el mismo valor, name y opciones', async () => {
    const alCambiar = vi.fn();
    simularPuntero(true);
    render(
      <form data-testid="formulario">
        <Controlado name="periodo" alCambiar={alCambiar} />
      </form>,
    );

    const select = screen.getByRole('combobox', { name: 'Período' }) as HTMLSelectElement;
    expect(select.tagName).toBe('SELECT');
    expect([...select.options].map((opcion) => opcion.text)).toEqual([
      'Todos los períodos',
      'Agosto 2026',
      'Septiembre 2026',
      'Octubre 2026',
      'Noviembre 2026',
    ]);
    expect(select.options[2]!.disabled).toBe(true);

    await userEvent.selectOptions(select, '2026-10');

    expect(alCambiar).toHaveBeenCalledWith('2026-10');
    expect(new FormData(screen.getByTestId('formulario') as HTMLFormElement).get('periodo')).toBe('2026-10');
  });
});
