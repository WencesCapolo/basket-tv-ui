import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { MenuDeUsuario } from '../src/menu-de-usuario';

const SALIR = 'https://portal.basket-app.com/logout';
const LANZADOR = 'https://portal.basket-app.com/apps';

afterEach(cleanup);

describe('MenuDeUsuario', () => {
  it('abre con las iniciales un menú con el usuario, el lanzador y la salida', async () => {
    render(<MenuDeUsuario nombre="Ana Pérez" rol="Admin" salirUrl={SALIR} lanzadorUrl={LANZADOR} />);

    const boton = screen.getByRole('button', { name: 'Menú de Ana Pérez' });
    expect(boton.textContent).toBe('AP');
    expect(screen.queryByRole('link', { name: 'Elegir aplicación' })).toBeNull();

    await userEvent.click(boton);

    expect(boton.getAttribute('aria-expanded')).toBe('true');
    const menu = within(document.getElementById(boton.getAttribute('aria-controls')!)!);
    expect(menu.getByText('Admin')).toBeTruthy();
    expect(menu.getByRole('link', { name: 'Elegir aplicación' }).getAttribute('href')).toBe(LANZADOR);
    expect(menu.getByRole('link', { name: 'Cerrar sesión' }).getAttribute('href')).toBe(SALIR);
  });

  it('sin lanzador el menú no ofrece elegir aplicación', async () => {
    render(<MenuDeUsuario nombre="Ana Pérez" rol="Admin" salirUrl={SALIR} />);

    await userEvent.click(screen.getByRole('button', { name: 'Menú de Ana Pérez' }));

    expect(screen.queryByRole('link', { name: 'Elegir aplicación' })).toBeNull();
  });

  it('se cierra con Escape, devolviendo el foco, y tocando afuera', async () => {
    render(
      <>
        <p>Afuera</p>
        <MenuDeUsuario nombre="Ana Pérez" rol="Admin" salirUrl={SALIR} lanzadorUrl={LANZADOR} />
      </>,
    );
    const boton = screen.getByRole('button', { name: 'Menú de Ana Pérez' });

    await userEvent.click(boton);
    await userEvent.keyboard('{Escape}');
    expect(boton.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(boton);

    await userEvent.click(boton);
    await userEvent.click(screen.getByText('Afuera'));
    expect(screen.queryByRole('link', { name: 'Elegir aplicación' })).toBeNull();
  });
});
