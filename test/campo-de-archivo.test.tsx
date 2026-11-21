import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CampoDeArchivo } from '../src/campo-de-archivo';

afterEach(cleanup);

describe('CampoDeArchivo', () => {
  it('takes a file chosen with the button or dropped on the zone, and the same file again', async () => {
    const onArchivo = vi.fn();
    const { container } = render(
      <CampoDeArchivo accept=".csv" boton="Elegir archivo" onArchivo={onArchivo}>
        Arrastrá el archivo acá
      </CampoDeArchivo>,
    );
    const archivo = new File(['a;b'], 'datos.csv', { type: 'text/csv' });
    const entrada = container.querySelector('input[type="file"]') as HTMLInputElement;

    await userEvent.setup().upload(entrada, archivo);
    expect(onArchivo).toHaveBeenLastCalledWith(archivo);
    expect(entrada.value).toBe('');

    fireEvent.drop(screen.getByText('Arrastrá el archivo acá'), { dataTransfer: { files: [archivo] } });
    expect(onArchivo).toHaveBeenCalledTimes(2);
  });
});
