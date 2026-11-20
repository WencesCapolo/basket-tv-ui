import * as React from 'react';
import { createPortal } from 'react-dom';
import { unir } from './unir.js';

// The floating panel under a field: the list of `Select` and
// `CampoConSugerencias`, the calendar of `CampoDeFecha`.

interface Posicion {
  left: number;
  width: number;
  maxHeight: number;
  top?: number;
  bottom?: number;
}

const SEPARACION = 6;
const ALTO_MAXIMO = 288;

function posicionJuntoA(ancla: HTMLElement, anchoMinimo: number, alto: number): Posicion {
  const rect = ancla.getBoundingClientRect();
  const abajo = window.innerHeight - rect.bottom - SEPARACION * 2;
  const arriba = rect.top - SEPARACION * 2;
  const width = Math.max(rect.width, anchoMinimo);
  const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
  if (abajo < Math.min(alto, 200) && arriba > abajo) {
    return { left, width, bottom: window.innerHeight - rect.top + SEPARACION, maxHeight: Math.min(alto, arriba) };
  }
  return { left, width, top: rect.bottom + SEPARACION, maxHeight: Math.min(alto, abajo) };
}

/**
 * A panel open next to `ancla`: placed below (above if it fits better), moved
 * on scroll and resize, closed by a mousedown outside the anchor. `abrir`
 * places it and opens it.
 */
export function useFlotante(ancla: React.RefObject<HTMLElement | null>, { anchoMinimo = 180, alto = ALTO_MAXIMO } = {}) {
  const [posicion, setPosicion] = React.useState<Posicion | null>(null);
  const panel = React.useRef<HTMLDivElement>(null);

  const abrir = React.useCallback(() => {
    if (ancla.current) setPosicion(posicionJuntoA(ancla.current, anchoMinimo, alto));
  }, [ancla, anchoMinimo, alto]);
  const cerrar = React.useCallback(() => setPosicion(null), []);
  const abierto = posicion !== null;

  React.useEffect(() => {
    if (!abierto) return;
    function alPresionar(evento: MouseEvent) {
      if (!ancla.current?.contains(evento.target as Node)) setPosicion(null);
    }
    function alMover(evento: Event) {
      if (panel.current?.contains(evento.target as Node)) return;
      if (ancla.current) setPosicion(posicionJuntoA(ancla.current, anchoMinimo, alto));
    }
    document.addEventListener('mousedown', alPresionar);
    window.addEventListener('scroll', alMover, true);
    window.addEventListener('resize', alMover);
    return () => {
      document.removeEventListener('mousedown', alPresionar);
      window.removeEventListener('scroll', alMover, true);
      window.removeEventListener('resize', alMover);
    };
  }, [abierto, ancla, anchoMinimo, alto]);

  return { abierto, abrir, cerrar, posicion, panel };
}

/**
 * The panel itself, in `<body>` or in the open `<dialog>` that holds the
 * anchor (with `showModal()` the rest is inert and below the top layer).
 * Fixed, above the `Marco` drawer and the modals. A click inside keeps the
 * focus on the field and does not reach the outside-click handlers of the
 * popovers and modals it lives in.
 */
export function Flotante({
  ancla,
  flotante,
  className,
  children,
  ...props
}: Omit<React.HTMLAttributes<HTMLDivElement>, 'style' | 'onMouseDown'> & {
  ancla: React.RefObject<HTMLElement | null>;
  flotante: ReturnType<typeof useFlotante>;
}) {
  const { posicion, panel } = flotante;
  if (!posicion) return null;
  return createPortal(
    <div
      {...props}
      ref={panel}
      onMouseDown={(evento) => {
        evento.preventDefault();
        evento.nativeEvent.stopImmediatePropagation();
      }}
      style={posicion}
      className={unir(
        'fixed z-[400] overflow-y-auto overscroll-contain rounded-[var(--panel-radius)] border border-[var(--border)] bg-[var(--surface)] p-1.5 text-sm text-[var(--foreground)] shadow-[var(--shadow-lift)]',
        className,
      )}
    >
      {children}
    </div>,
    ancla.current?.closest('dialog[open]') ?? document.body,
  );
}

/** Sets a form control's value the way the browser does, so React's `onChange` and the form see a real change. */
export function escribirValor(control: HTMLInputElement | HTMLSelectElement, valor: string) {
  const prototipo = control instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototipo, 'value')?.set?.call(control, valor);
  control.dispatchEvent(new Event('input', { bubbles: true }));
  control.dispatchEvent(new Event('change', { bubbles: true }));
}

/** Lowercase and without accents, to compare what someone types with an option. */
export function plegar(texto: string) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}
