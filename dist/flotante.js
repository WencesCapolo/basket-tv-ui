import { jsx as _jsx } from "react/jsx-runtime";
import * as React from 'react';
import { createPortal } from 'react-dom';
import { unir } from './unir.js';
const SEPARACION = 6;
const ALTO_MAXIMO = 288;
function posicionJuntoA(ancla, anchoMinimo, alto) {
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
export function useFlotante(ancla, { anchoMinimo = 180, alto = ALTO_MAXIMO } = {}) {
    const [posicion, setPosicion] = React.useState(null);
    const panel = React.useRef(null);
    const abrir = React.useCallback(() => {
        if (ancla.current)
            setPosicion(posicionJuntoA(ancla.current, anchoMinimo, alto));
    }, [ancla, anchoMinimo, alto]);
    const cerrar = React.useCallback(() => setPosicion(null), []);
    const abierto = posicion !== null;
    React.useEffect(() => {
        if (!abierto)
            return;
        function alPresionar(evento) {
            if (!ancla.current?.contains(evento.target))
                setPosicion(null);
        }
        function alMover(evento) {
            if (panel.current?.contains(evento.target))
                return;
            if (ancla.current)
                setPosicion(posicionJuntoA(ancla.current, anchoMinimo, alto));
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
export function Flotante({ ancla, flotante, className, children, ...props }) {
    const { posicion, panel } = flotante;
    if (!posicion)
        return null;
    return createPortal(_jsx("div", { ...props, ref: panel, onMouseDown: (evento) => {
            evento.preventDefault();
            evento.nativeEvent.stopImmediatePropagation();
        }, style: posicion, className: unir('fixed z-[400] overflow-y-auto overscroll-contain rounded-[var(--panel-radius)] border border-[var(--border)] bg-[var(--surface)] p-1.5 text-sm text-[var(--foreground)] shadow-[var(--shadow-lift)]', className), children: children }), ancla.current?.closest('dialog[open]') ?? document.body);
}
/** Sets a form control's value the way the browser does, so React's `onChange` and the form see a real change. */
export function escribirValor(control, valor) {
    const prototipo = control instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(prototipo, 'value')?.set?.call(control, valor);
    control.dispatchEvent(new Event('input', { bubbles: true }));
    control.dispatchEvent(new Event('change', { bubbles: true }));
}
/** Lowercase and without accents, to compare what someone types with an option. */
export function plegar(texto) {
    return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}
