import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BotonDeVolver, destinoDeVolver } from '../src/volver';

const LANZADOR = 'https://basket-app.com';
const SECCIONES = [
  { href: '/ar', activa: false },
  { href: '/int', activa: true },
  { href: 'https://portal.basket-app.com/reportes', activa: false },
];

describe('destinoDeVolver', () => {
  it('en la página de una sección, aun con filtros, va al lanzador', () => {
    expect(destinoDeVolver('http://localhost/int?dia=2026-10-30', SECCIONES, LANZADOR)).toEqual({
      tipo: 'lanzador',
      href: LANZADOR,
    });
    expect(destinoDeVolver('http://localhost/int/', SECCIONES, LANZADOR).tipo).toBe('lanzador');
    expect(destinoDeVolver('http://localhost/', [], LANZADOR).tipo).toBe('lanzador');
  });

  it('dentro de una sección va atrás, y sin historial a la sección activa', () => {
    expect(destinoDeVolver('http://localhost/int/123', SECCIONES, LANZADOR)).toEqual({
      tipo: 'atras',
      href: '/int',
      seccion: SECCIONES[1],
    });
  });

  it('sin sección activa propia, el respaldo es el lanzador', () => {
    expect(destinoDeVolver('http://localhost/match/9', [], LANZADOR)).toEqual({ tipo: 'atras', href: LANZADOR, seccion: null });
  });

  it('una sección de otro origen no cuenta como raíz', () => {
    expect(destinoDeVolver('http://localhost/reportes', SECCIONES, LANZADOR).tipo).toBe('atras');
  });
});

describe('BotonDeVolver', () => {
  const Enlace = (props: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a {...props} />;

  afterEach(() => {
    cleanup();
    window.history.replaceState(null, '', '/');
    vi.restoreAllMocks();
  });

  it('en la raíz es un enlace al lanzador', () => {
    window.history.replaceState(null, '', '/int?dia=2026-10-30');
    render(<BotonDeVolver lanzadorUrl={LANZADOR} secciones={SECCIONES} enlace={Enlace} />);

    expect(screen.getByRole('link', { name: 'Volver' }).getAttribute('href')).toBe(LANZADOR);
  });

  it('en un detalle al que se llegó navegando, va atrás', () => {
    window.history.replaceState(null, '', '/int?dia=2026-10-30');
    render(<BotonDeVolver lanzadorUrl={LANZADOR} secciones={SECCIONES} enlace={Enlace} />);
    window.history.pushState(null, '', '/int/123');
    const atras = vi.spyOn(window.history, 'back').mockImplementation(() => {});

    fireEvent.click(screen.getByRole('link', { name: 'Volver' }));

    expect(atras).toHaveBeenCalledOnce();
  });

  it('en un detalle abierto directo, lleva a la sección', () => {
    window.history.replaceState(null, '', '/int/123');
    render(<BotonDeVolver lanzadorUrl={LANZADOR} secciones={SECCIONES} enlace={Enlace} />);
    const atras = vi.spyOn(window.history, 'back');

    const enlace = screen.getByRole('link', { name: 'Volver' });
    expect(enlace.getAttribute('href')).toBe('/int');
    expect(fireEvent.click(enlace)).toBe(true);
    expect(atras).not.toHaveBeenCalled();
  });
});
