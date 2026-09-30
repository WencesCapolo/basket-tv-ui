import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CampanaDeSolicitudes, type SolicitudPendiente } from '../src/campana-de-solicitudes';

const FACTURACION: SolicitudPendiente = {
  id: 's-1',
  app: 'facturacion',
  nombreDeApp: 'Facturación',
  nombre: 'Ana Pérez',
  email: 'ana@example.com',
  telefono: '+54 11 5555 5555',
  ciudad: 'Rosario',
  roles: [
    { valor: 'lector', etiqueta: 'Lector' },
    { valor: 'editor', etiqueta: 'Editor' },
  ],
};

const INCIDENCIAS: SolicitudPendiente = {
  id: 's-2',
  app: 'incidencias',
  nombreDeApp: 'Incidencias',
  nombre: 'Bruno Díaz',
  email: 'bruno@example.com',
  roles: [{ valor: 'operador', etiqueta: 'Operador' }],
};

function datosDe(accion: ReturnType<typeof vi.fn>) {
  return Object.fromEntries((accion.mock.calls[0]?.[0] as FormData).entries());
}

beforeEach(() => window.sessionStorage.clear());
afterEach(cleanup);

describe('CampanaDeSolicitudes', () => {
  it('muestra la cantidad y se abre sola con pendientes nuevas', async () => {
    render(<CampanaDeSolicitudes solicitudes={[FACTURACION, INCIDENCIAS]} aprobar={vi.fn()} rechazar={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Solicitudes de acceso pendientes: 2' })).toBeTruthy();
    const modal = await screen.findByRole('dialog');
    expect(within(modal).getByText('2 solicitudes pendientes')).toBeTruthy();
    expect(within(modal).getAllByText('Facturación').length).toBeGreaterThan(0);
    expect(within(modal).getByText('Incidencias')).toBeTruthy();
  });

  it('no se vuelve a abrir sola para el mismo conjunto', async () => {
    const { unmount } = render(<CampanaDeSolicitudes solicitudes={[FACTURACION]} aprobar={vi.fn()} rechazar={vi.fn()} />);
    await screen.findByRole('dialog');
    unmount();

    render(<CampanaDeSolicitudes solicitudes={[FACTURACION]} aprobar={vi.fn()} rechazar={vi.fn()} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('aprueba con el rol elegido, la app y los campos ocultos', async () => {
    const aprobar = vi.fn();
    render(
      <CampanaDeSolicitudes
        solicitudes={[FACTURACION]}
        aprobar={aprobar}
        rechazar={vi.fn()}
        camposOcultos={{ volverA: '/' }}
      />,
    );
    const modal = await screen.findByRole('dialog');

    await userEvent.selectOptions(within(modal).getByLabelText('Rol'), 'editor');
    await userEvent.click(within(modal).getByRole('button', { name: 'Aprobar' }));

    expect(aprobar).toHaveBeenCalledOnce();
    expect(datosDe(aprobar)).toEqual({ solicitudId: 's-1', app: 'facturacion', volverA: '/', rol: 'editor' });
  });

  it('no aprueba sin elegir rol cuando hay varios', async () => {
    const aprobar = vi.fn();
    render(<CampanaDeSolicitudes solicitudes={[FACTURACION]} aprobar={aprobar} rechazar={vi.fn()} />);
    const modal = await screen.findByRole('dialog');

    await userEvent.click(within(modal).getByRole('button', { name: 'Aprobar' }));

    expect(aprobar).not.toHaveBeenCalled();
  });

  it('rechaza sin rol', async () => {
    const rechazar = vi.fn();
    render(<CampanaDeSolicitudes solicitudes={[INCIDENCIAS]} aprobar={vi.fn()} rechazar={rechazar} />);
    const modal = await screen.findByRole('dialog');

    await userEvent.click(within(modal).getByRole('button', { name: 'Rechazar' }));

    expect(datosDe(rechazar)).toEqual({ solicitudId: 's-2', app: 'incidencias' });
  });

  it('sin roles para otorgar solo deja rechazar', async () => {
    render(
      <CampanaDeSolicitudes solicitudes={[{ ...INCIDENCIAS, roles: [] }]} aprobar={vi.fn()} rechazar={vi.fn()} />,
    );
    const modal = await screen.findByRole('dialog');

    expect(within(modal).queryByRole('button', { name: 'Aprobar' })).toBeNull();
    expect(within(modal).getByRole('button', { name: 'Rechazar' })).toBeTruthy();
  });

  it('usa la decisión propia de la app en lugar del selector de rol', async () => {
    render(
      <CampanaDeSolicitudes
        solicitudes={[{ ...FACTURACION, decision: <p>Formulario del Portal</p> }]}
        aprobar={vi.fn()}
        rechazar={vi.fn()}
      />,
    );
    const modal = await screen.findByRole('dialog');

    expect(within(modal).getByText('Formulario del Portal')).toBeTruthy();
    expect(within(modal).queryByLabelText('Rol')).toBeNull();
  });

  it('se cierra con Escape y vuelve a abrirse desde la campana', async () => {
    render(<CampanaDeSolicitudes solicitudes={[INCIDENCIAS]} aprobar={vi.fn()} rechazar={vi.fn()} />);
    await screen.findByRole('dialog');

    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: 'Solicitudes de acceso pendientes: 1' }));
    expect(screen.getByRole('dialog')).toBeTruthy();
  });
});
