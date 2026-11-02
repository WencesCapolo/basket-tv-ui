import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { Select, Selector } from '../src/select';

beforeAll(() => {
  // jsdom has no layout: the list scrolls the active option into view.
  Element.prototype.scrollIntoView = () => {};
});

afterEach(cleanup);

const PERIODOS = [
  <option key="" value="">
    Todos los períodos
  </option>,
  <option key="08" value="2026-08">
    Agosto 2026
  </option>,
  <option key="09" value="2026-09" disabled>
    Septiembre 2026
  </option>,
  <option key="10" value="2026-10">
    Octubre 2026
  </option>,
  <option key="11" value="2026-11">
    Noviembre 2026
  </option>,
];

function Controlado({ alCambiar = () => {} }: { alCambiar?: (valor: string) => void }) {
  const [valor, setValor] = useState('');
  return (
    <Select
      aria-label="Período"
      value={valor}
      onChange={(evento) => {
        setValor(evento.target.value);
        alCambiar(evento.target.value);
      }}
    >
      {PERIODOS}
    </Select>
  );
}

const boton = () => screen.getByRole('combobox', { name: 'Período' });
const nativo = (contenedor: HTMLElement) => contenedor.querySelector('select') as HTMLSelectElement;
const activa = () => {
  const id = boton().getAttribute('aria-activedescendant');
  return id ? document.getElementById(id)?.textContent : null;
};

describe('Select', () => {
  it('opens on click, chooses an option and closes, back on the button', async () => {
    const usuario = userEvent.setup();
    const alCambiar = vi.fn();
    render(<Controlado alCambiar={alCambiar} />);

    expect(boton()).toHaveProperty('textContent', 'Todos los períodos');
    expect(boton().getAttribute('aria-expanded')).toBe('false');

    await usuario.click(boton());
    const lista = screen.getByRole('listbox');
    expect(lista.parentElement).toBe(document.body);
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual([
      'Todos los períodos',
      'Agosto 2026',
      'Septiembre 2026',
      'Octubre 2026',
      'Noviembre 2026',
    ]);

    await usuario.click(screen.getByRole('option', { name: 'Octubre 2026' }));

    expect(alCambiar).toHaveBeenCalledWith('2026-10');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(boton().textContent).toBe('Octubre 2026');
    expect(document.activeElement).toBe(boton());

    await usuario.click(boton());
    expect(screen.getByRole('option', { name: 'Octubre 2026' }).getAttribute('aria-selected')).toBe('true');
  });

  it('a disabled option does nothing on click', async () => {
    const usuario = userEvent.setup();
    const alCambiar = vi.fn();
    render(<Controlado alCambiar={alCambiar} />);

    await usuario.click(boton());
    await usuario.click(screen.getByRole('option', { name: 'Septiembre 2026' }));

    expect(alCambiar).not.toHaveBeenCalled();
    expect(screen.getByRole('listbox')).toBeTruthy();
  });

  it('uses its own list everywhere: no native fallback on a coarse pointer', async () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
    const usuario = userEvent.setup();
    const { container } = render(<Controlado />);

    expect(nativo(container).getAttribute('aria-hidden')).toBe('true');
    expect(nativo(container).tabIndex).toBe(-1);
    await usuario.click(boton());
    expect(screen.getByRole('listbox')).toBeTruthy();
    vi.unstubAllGlobals();
  });

  it('arrows skip disabled options, Home/End jump, Enter chooses', async () => {
    const usuario = userEvent.setup();
    const alCambiar = vi.fn();
    render(<Controlado alCambiar={alCambiar} />);

    boton().focus();
    await usuario.keyboard('{ArrowDown}');
    expect(screen.getByRole('listbox')).toBeTruthy();
    expect(activa()).toBe('Todos los períodos');

    await usuario.keyboard('{ArrowDown}{ArrowDown}');
    expect(activa()).toBe('Octubre 2026');
    await usuario.keyboard('{ArrowUp}');
    expect(activa()).toBe('Agosto 2026');
    await usuario.keyboard('{End}');
    expect(activa()).toBe('Noviembre 2026');
    await usuario.keyboard('{ArrowDown}');
    expect(activa()).toBe('Noviembre 2026');
    await usuario.keyboard('{Home}');
    expect(activa()).toBe('Todos los períodos');

    await usuario.keyboard('{End}{Enter}');
    expect(alCambiar).toHaveBeenCalledWith('2026-11');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('Space opens and chooses', async () => {
    const usuario = userEvent.setup();
    const alCambiar = vi.fn();
    render(<Controlado alCambiar={alCambiar} />);

    boton().focus();
    await usuario.keyboard(' ');
    expect(screen.getByRole('listbox')).toBeTruthy();
    await usuario.keyboard('{ArrowDown} ');
    expect(alCambiar).toHaveBeenCalledWith('2026-08');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('Escape closes, keeps focus on the button and does not reach a modal', async () => {
    const usuario = userEvent.setup();
    const cerrarModal = vi.fn();
    render(
      <div onKeyDown={(evento) => evento.key === 'Escape' && cerrarModal()}>
        <Controlado />
      </div>,
    );

    await usuario.click(boton());
    await usuario.keyboard('{Escape}');

    expect(screen.queryByRole('listbox')).toBeNull();
    expect(document.activeElement).toBe(boton());
    expect(cerrarModal).not.toHaveBeenCalled();
  });

  it('Tab closes the list and moves on', async () => {
    const usuario = userEvent.setup();
    render(
      <>
        <Controlado />
        <button type="button">Siguiente</button>
      </>,
    );

    await usuario.click(boton());
    await usuario.tab();

    expect(screen.queryByRole('listbox')).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Siguiente' }));
  });

  it('typing jumps to the first enabled label, ignoring accents and case', async () => {
    const usuario = userEvent.setup();
    const alCambiar = vi.fn();
    render(
      <Select aria-label="Ciudad" defaultValue="" onChange={(e) => alCambiar(e.target.value)}>
        <option value="">Elegí</option>
        <option value="bog">Bogotá</option>
        <option value="med">Medellín</option>
        <option value="mex">México</option>
        <option value="mia" disabled>
          Miami
        </option>
        <option value="mon">Montevideo</option>
      </Select>,
    );
    const ciudad = screen.getByRole('combobox', { name: 'Ciudad' });
    const activaDe = () => document.getElementById(ciudad.getAttribute('aria-activedescendant') ?? '')?.textContent;

    ciudad.focus();
    await usuario.keyboard('m');
    expect(screen.getByRole('listbox')).toBeTruthy();
    expect(activaDe()).toBe('Medellín');
    await usuario.keyboard('é');
    expect(activaDe()).toBe('Medellín');
    await usuario.keyboard('x');
    expect(activaDe()).toBe('México');
    await usuario.keyboard('{Enter}');
    expect(alCambiar).toHaveBeenCalledWith('mex');

    await act(() => new Promise((listo) => setTimeout(listo, 800)));
    await usuario.keyboard('{Enter}');
    await usuario.keyboard('mi');
    expect(activaDe()).toBe('Medellín'); // 'm' moved there; Miami is disabled, so 'mi' finds nothing
    await act(() => new Promise((listo) => setTimeout(listo, 800)));
    await usuario.keyboard('mo');
    expect(activaDe()).toBe('Montevideo');
  });

  it('shows optgroup labels as headers', async () => {
    const usuario = userEvent.setup();
    render(
      <Select aria-label="Rol" defaultValue="op">
        <optgroup label="Producción">
          <option value="prod">Productor</option>
          <option value="op">Operador</option>
        </optgroup>
        <optgroup label="Gráfica">
          <option value="gc">Graficador</option>
        </optgroup>
      </Select>,
    );

    await usuario.click(screen.getByRole('combobox', { name: 'Rol' }));
    const lista = screen.getByRole('listbox');

    expect(Array.from(lista.children).map((hijo) => `${hijo.getAttribute('role') ?? 'grupo'}:${hijo.textContent}`)).toEqual([
      'grupo:Producción',
      'option:Productor',
      'option:Operador',
      'grupo:Gráfica',
      'option:Graficador',
    ]);
  });

  it('onChange gets the change event of the native select, with target.value and name', async () => {
    const usuario = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Select aria-label="Período" name="periodo" defaultValue="" onChange={onChange}>
        {PERIODOS}
      </Select>,
    );

    await usuario.click(boton());
    await usuario.click(screen.getByRole('option', { name: 'Agosto 2026' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    const evento = onChange.mock.calls[0][0];
    expect(evento.type).toBe('change');
    expect(evento.target).toBeInstanceOf(HTMLSelectElement);
    expect(evento.target.value).toBe('2026-08');
    expect(evento.target.name).toBe('periodo');
  });

  it('posts its value with the form, also through form=', async () => {
    const usuario = userEvent.setup();
    const { container } = render(
      <>
        <form id="filtros" />
        <form id="local">
          <Select aria-label="Período" name="periodo" defaultValue="2026-10">
            {PERIODOS}
          </Select>
          <Select aria-label="Afuera" name="afuera" form="filtros" defaultValue="2026-08">
            {PERIODOS}
          </Select>
        </form>
      </>,
    );
    const [filtros, local] = Array.from(container.querySelectorAll('form'));

    expect(new FormData(local).get('periodo')).toBe('2026-10');
    await usuario.click(boton());
    await usuario.click(screen.getByRole('option', { name: 'Noviembre 2026' }));
    expect(new FormData(local).get('periodo')).toBe('2026-11');

    expect(new FormData(filtros).get('afuera')).toBe('2026-08');
    expect(new FormData(local).has('afuera')).toBe(false);
  });

  it('required: an empty value is invalid, the button turns red until a value is chosen', async () => {
    const usuario = userEvent.setup();
    const { container } = render(
      <form>
        <Select aria-label="Período" name="periodo" required defaultValue="">
          {PERIODOS}
        </Select>
      </form>,
    );
    const formulario = container.querySelector('form') as HTMLFormElement;

    expect(boton().className).not.toContain('bg-[var(--accent-soft)]');
    act(() => {
      expect(formulario.checkValidity()).toBe(false);
    });
    expect(boton().className).toContain('border-[var(--accent)]');
    expect(boton().className).toContain('bg-[var(--accent-soft)]');

    await usuario.click(boton());
    await usuario.click(screen.getByRole('option', { name: 'Agosto 2026' }));
    expect(formulario.checkValidity()).toBe(true);
    expect(boton().className).not.toContain('bg-[var(--accent-soft)]');
  });

  it('uncontrolled: keeps its own value and goes back to defaultValue on form reset', async () => {
    const usuario = userEvent.setup();
    const { container } = render(
      <form>
        <Select aria-label="Período" name="periodo" defaultValue="2026-10">
          {PERIODOS}
        </Select>
      </form>,
    );
    const formulario = container.querySelector('form') as HTMLFormElement;

    expect(boton().textContent).toBe('Octubre 2026');
    await usuario.click(boton());
    await usuario.click(screen.getByRole('option', { name: 'Agosto 2026' }));
    expect(boton().textContent).toBe('Agosto 2026');

    await act(async () => {
      formulario.reset();
      await new Promise((listo) => setTimeout(listo));
    });
    expect(boton().textContent).toBe('Octubre 2026');
    expect(new FormData(formulario).get('periodo')).toBe('2026-10');
  });

  it('disabled: the button and the native select are disabled', async () => {
    const { container } = render(
      <Select aria-label="Período" name="periodo" disabled defaultValue="2026-08">
        {PERIODOS}
      </Select>,
    );

    expect(boton()).toHaveProperty('disabled', true);
    expect(nativo(container).disabled).toBe(true);
    fireEvent.click(boton());
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('autoFocus focuses the button; defaultOpen also opens the list', () => {
    render(
      <>
        <Select aria-label="Período" autoFocus defaultValue="">
          {PERIODOS}
        </Select>
        <Select aria-label="Otro" defaultOpen defaultValue="2026-10">
          {PERIODOS}
        </Select>
      </>,
    );

    const otro = screen.getByRole('combobox', { name: 'Otro' });
    expect(document.activeElement).toBe(otro);
    expect(otro.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('listbox')).toBeTruthy();
  });

  it('passes button props through and lets className win over its own classes', () => {
    render(
      <Select aria-label="Período" id="periodo" title="Elegí" data-prueba="si" className="h-11 rounded-xl px-3 py-0" defaultValue="">
        {PERIODOS}
      </Select>,
    );

    expect(boton().id).toBe('periodo');
    expect(boton().title).toBe('Elegí');
    expect(boton().dataset.prueba).toBe('si');
    expect(boton().getAttribute('type')).toBe('button');
    const clases = boton().className.split(' ');
    expect(clases).toContain('rounded-xl');
    expect(clases).not.toContain('rounded-[var(--panel-radius)]');
    expect(clases).toContain('px-3');
    expect(clases).not.toContain('px-4');
    expect(clases).not.toContain('py-3');
  });

  it('the list is fixed above the Marco drawer and modals, and flips up without room below', async () => {
    const usuario = userEvent.setup();
    render(<Controlado />);
    boton().getBoundingClientRect = () =>
      ({ top: 700, bottom: 744, left: 20, right: 220, width: 200, height: 44 }) as DOMRect;
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 768 });

    await usuario.click(boton());
    const lista = screen.getByRole('listbox');

    expect(lista.className).toContain('fixed');
    expect(lista.className).toContain('z-[400]');
    expect(lista.style.bottom).toBe(`${768 - 700 + 6}px`);
    expect(lista.style.top).toBe('');
  });

  it('a click inside the list does not reach outside-click handlers', async () => {
    const usuario = userEvent.setup();
    const afuera = vi.fn();
    render(<Controlado />);

    await usuario.click(boton());
    document.addEventListener('mousedown', afuera);
    await usuario.click(screen.getByRole('option', { name: 'Agosto 2026' }));
    document.removeEventListener('mousedown', afuera);

    expect(afuera).not.toHaveBeenCalled();
    expect(boton().textContent).toBe('Agosto 2026');
  });

  it('a click outside closes it without choosing', async () => {
    const usuario = userEvent.setup();
    const alCambiar = vi.fn();
    render(
      <>
        <Controlado alCambiar={alCambiar} />
        <p>Afuera</p>
      </>,
    );

    await usuario.click(boton());
    await usuario.click(screen.getByText('Afuera'));

    expect(screen.queryByRole('listbox')).toBeNull();
    expect(alCambiar).not.toHaveBeenCalled();
  });

  it('pastilla: a compact uppercase pill whose colours come from className', async () => {
    const usuario = userEvent.setup();
    render(
      <Select aria-label="Estado" variante="pastilla" defaultValue="pagada" className="border-ok-border bg-ok-soft text-ok">
        <option value="pendiente">Pendiente</option>
        <option value="pagada">Pagada</option>
      </Select>,
    );
    const estado = screen.getByRole('combobox', { name: 'Estado' });
    const clases = estado.className.split(' ');

    expect(estado.dataset.variante).toBe('pastilla');
    for (const clase of ['rounded-full', 'uppercase', 'text-[11px]', 'h-7', 'bg-ok-soft', 'text-ok', 'border-ok-border']) {
      expect(clases).toContain(clase);
    }
    expect(clases).not.toContain('bg-[var(--n-100)]');
    expect(clases).not.toContain('text-[var(--n-700)]');
    expect(clases).not.toContain('border-transparent');
    expect(clases).not.toContain('w-full');

    await usuario.click(estado);
    await usuario.click(screen.getByRole('option', { name: 'Pendiente' }));
    expect(estado.textContent).toBe('Pendiente');
  });

  it('defaults to the Portal field look', () => {
    render(
      <Select aria-label="Período" defaultValue="">
        {PERIODOS}
      </Select>,
    );

    expect(boton().dataset.variante).toBe('campo');
    expect(boton().className).toContain('rounded-[var(--panel-radius)] border border-[var(--border)] bg-[var(--background-soft)] px-4 py-3');
  });

  it('Selector is the same component', () => {
    expect(Selector).toBe(Select);
  });
});
