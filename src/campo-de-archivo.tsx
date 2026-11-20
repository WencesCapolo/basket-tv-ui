import * as React from 'react';
import { unir } from './unir.js';

export type CampoDeArchivoProps = {
  /** Called with the file chosen with the button or dropped on the zone. The input is emptied after, so the same file can come again. */
  onArchivo: (archivo: File) => void;
  /** What it takes, as in `<input accept>`: `.xlsx,.csv`. */
  accept?: string;
  /** The button's text. */
  boton: React.ReactNode;
  /** The zone's text, above the button. */
  children?: React.ReactNode;
  disabled?: boolean;
  className?: string;
};

/** A dashed zone to drop a file on, with a button that opens the system's file picker. */
export function CampoDeArchivo({ onArchivo, accept, boton, children, disabled, className }: CampoDeArchivoProps) {
  const entrada = React.useRef<HTMLInputElement>(null);
  const [encima, setEncima] = React.useState(false);
  return (
    <div
      onDragOver={(evento) => {
        if (disabled) return;
        evento.preventDefault();
        setEncima(true);
      }}
      onDragLeave={() => setEncima(false)}
      onDrop={(evento) => {
        evento.preventDefault();
        setEncima(false);
        const archivo = evento.dataTransfer.files[0];
        if (archivo && !disabled) onArchivo(archivo);
      }}
      className={unir(
        'grid place-items-center gap-2 rounded-[var(--panel-radius)] border-2 border-dashed px-4 py-8 text-center text-sm',
        encima ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--border)]',
        className,
      )}
    >
      {children}
      <button
        type="button"
        disabled={disabled}
        onClick={() => entrada.current?.click()}
        className="inline-flex items-center justify-center rounded-[var(--panel-radius)] bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {boton}
      </button>
      <input
        ref={entrada}
        type="file"
        accept={accept}
        hidden
        onChange={(evento) => {
          const archivo = evento.target.files?.[0];
          if (archivo) onArchivo(archivo);
          evento.target.value = '';
        }}
      />
    </div>
  );
}
