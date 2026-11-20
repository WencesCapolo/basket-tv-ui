import type * as React from 'react';
import { Icono } from './iconos.js';
import { unir } from './unir.js';

export type CasillaProps = Omit<React.ComponentProps<'input'>, 'type' | 'children'> & {
  /** The text beside the box. Without it, give the box an `aria-label` (a grid cell). */
  texto?: React.ReactNode;
};

/** A checkbox drawn with the tokens. A native `<input type="checkbox">` underneath: same props, form and keyboard. */
export function Casilla({ texto, className, disabled, ...props }: CasillaProps) {
  return (
    <label className={unir('inline-flex items-center gap-2 text-sm text-[var(--foreground)]', disabled ? 'cursor-not-allowed opacity-55' : 'cursor-pointer', className)}>
      <span className="relative grid size-4 shrink-0 place-items-center">
        <input
          {...props}
          type="checkbox"
          disabled={disabled}
          className="peer size-4 appearance-none rounded-[4px] border border-[var(--n-300)] bg-[var(--surface)] outline-none transition checked:border-[var(--accent)] checked:bg-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] disabled:cursor-not-allowed"
        />
        <Icono nombre="elegida" grosor={3} className="pointer-events-none absolute size-3 text-white opacity-0 peer-checked:opacity-100" />
      </span>
      {texto}
    </label>
  );
}
