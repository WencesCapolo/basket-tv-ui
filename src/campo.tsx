import type * as React from 'react';
import { unir } from './unir.js';

/** `campo`: the Portal's form field. `compacto`: a field in a data-grid cell. */
export type VarianteDeCampo = 'campo' | 'compacto';

const COMUNES =
  'w-full border border-[var(--border)] text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] hover:border-[var(--n-300)] focus:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:border-[var(--border)]';

/** The look every field shares, by variant: `Campo`, `AreaDeTexto` and the buttons of `Select` and `CampoDeFecha`. */
export const CLASES_DE_CAMPO: Record<VarianteDeCampo, string> = {
  campo: unir(
    COMUNES,
    'rounded-[var(--panel-radius)] bg-[var(--background-soft)] px-4 py-3 text-sm focus:bg-[var(--surface)] focus:ring-4 focus:ring-[rgba(230,18,56,0.08)]',
  ),
  compacto: unir(COMUNES, 'rounded-md bg-[var(--surface)] px-1.5 py-1 text-xs'),
};

/** What a field shows once the browser finds it invalid (after the person touched it, or on submit). */
const INVALIDO = 'user-invalid:border-[var(--accent)] user-invalid:bg-[var(--accent-soft)]';

export type CampoProps = Omit<React.ComponentProps<'input'>, 'type'> & {
  type?: 'text' | 'number' | 'email' | 'password' | 'search' | 'tel' | 'url';
  variante?: VarianteDeCampo;
};

/** The Portal's `Input`. Dates go in `CampoDeFecha`, checkboxes in `Casilla`, files in `CampoDeArchivo`. */
export function Campo({ className, variante = 'campo', type = 'text', ...props }: CampoProps) {
  return <input {...props} type={type} data-variante={variante} className={unir(CLASES_DE_CAMPO[variante], INVALIDO, className)} />;
}

export type AreaDeTextoProps = React.ComponentProps<'textarea'> & { variante?: VarianteDeCampo };

/** The Portal's `Textarea`. */
export function AreaDeTexto({ className, variante = 'campo', ...props }: AreaDeTextoProps) {
  return <textarea {...props} data-variante={variante} className={unir(CLASES_DE_CAMPO[variante], INVALIDO, 'resize-y', className)} />;
}
