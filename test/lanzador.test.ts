import { describe, expect, it } from 'vitest';
import { urlDeSolicitud } from '../src/lanzador';

describe('urlDeSolicitud', () => {
  it('lleva al formulario del Portal con la app pedida', () => {
    expect(urlDeSolicitud('https://portal.basket-app.com', 'facturacion')).toBe(
      'https://portal.basket-app.com/no-access?app=facturacion',
    );
  });

  it('no duplica la barra final del Portal', () => {
    expect(urlDeSolicitud('http://portal.basket-app.localhost:3000/', 'ops')).toBe(
      'http://portal.basket-app.localhost:3000/no-access?app=ops',
    );
  });

  it('escapa la clave de la app', () => {
    expect(urlDeSolicitud('https://portal.basket-app.com', 'a&b')).toBe(
      'https://portal.basket-app.com/no-access?app=a%26b',
    );
  });
});
