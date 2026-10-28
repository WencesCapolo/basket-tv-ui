import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { Marco, type EnlaceDeNavegacion } from '../src/marco';

const seccion = (titulo: string, grupo?: string): EnlaceDeNavegacion => ({
  clave: titulo,
  titulo,
  icono: null,
  href: `/${titulo.toLowerCase()}`,
  activa: false,
  grupo,
});

const AGRUPADAS = [
  seccion('Cashflow', 'Caja'),
  seccion('Movimientos', 'Caja'),
  seccion('Desvíos', 'Análisis'),
  seccion('Historial', 'Control'),
];

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

function barraLateral() {
  return within(screen.getAllByRole('navigation', { name: 'Secciones' })[0]);
}

describe('Marco', () => {
  it('pinta un rótulo cada vez que cambia el grupo, sin tocar los enlaces', () => {
    render(<Marco nombreDeApp="Cashflow" secciones={AGRUPADAS}>contenido</Marco>);

    const nav = barraLateral();
    expect(nav.getAllByText('Caja')).toHaveLength(1);
    expect(nav.getByText('Análisis')).toBeTruthy();
    expect(nav.getByText('Control')).toBeTruthy();
    expect(nav.getAllByRole('link').map((enlace) => enlace.textContent)).toEqual([
      'Cashflow',
      'Movimientos',
      'Desvíos',
      'Historial',
    ]);
  });

  it('sin grupos la barra queda igual que antes', () => {
    render(<Marco nombreDeApp="Portal" secciones={[seccion('Grilla'), seccion('Personas')]}>contenido</Marco>);

    const nav = screen.getAllByRole('navigation', { name: 'Secciones' })[0];
    expect(nav.querySelectorAll('p')).toHaveLength(0);
    expect(within(nav).getAllByRole('link')).toHaveLength(2);
  });

  it('con la barra compacta no pinta los rótulos', async () => {
    window.localStorage.setItem('basket-tv-ui.barra-lateral.compacta', 'true');
    render(<Marco nombreDeApp="Cashflow" secciones={AGRUPADAS}>contenido</Marco>);

    await screen.findByRole('button', { name: 'Mostrar navegación' });
    expect(barraLateral().queryByText('Caja')).toBeNull();
    expect(barraLateral().getByRole('link', { name: 'Cashflow' })).toBeTruthy();
  });

  it('en el cajón del celular no pinta los rótulos', async () => {
    render(<Marco nombreDeApp="Cashflow" secciones={AGRUPADAS}>contenido</Marco>);

    await userEvent.click(screen.getByRole('button', { name: 'Abrir navegación' }));

    const cajon = within(screen.getByRole('dialog', { name: 'Navegación' }));
    expect(cajon.queryByText('Caja')).toBeNull();
    expect(cajon.getAllByRole('link')).toHaveLength(4);
  });
});
