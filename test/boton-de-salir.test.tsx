import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BotonDeSalir } from '../src/marco';

describe('BotonDeSalir', () => {
  it('es un enlace común al /logout del Portal', () => {
    render(<BotonDeSalir href="https://portal.basket-app.com/logout" />);

    const enlace = screen.getByRole('link', { name: 'Cerrar sesión' });
    expect(enlace.getAttribute('href')).toBe('https://portal.basket-app.com/logout');
  });
});
