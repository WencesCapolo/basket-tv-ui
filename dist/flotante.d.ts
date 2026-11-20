import * as React from 'react';
interface Posicion {
    left: number;
    width: number;
    maxHeight: number;
    top?: number;
    bottom?: number;
}
/**
 * A panel open next to `ancla`: placed below (above if it fits better), moved
 * on scroll and resize, closed by a mousedown outside the anchor. `abrir`
 * places it and opens it.
 */
export declare function useFlotante(ancla: React.RefObject<HTMLElement | null>, { anchoMinimo, alto }?: {
    anchoMinimo?: number | undefined;
    alto?: number | undefined;
}): {
    abierto: boolean;
    abrir: () => void;
    cerrar: () => void;
    posicion: Posicion | null;
    panel: React.RefObject<HTMLDivElement | null>;
};
/**
 * The panel itself, in `<body>` or in the open `<dialog>` that holds the
 * anchor (with `showModal()` the rest is inert and below the top layer).
 * Fixed, above the `Marco` drawer and the modals. A click inside keeps the
 * focus on the field and does not reach the outside-click handlers of the
 * popovers and modals it lives in.
 */
export declare function Flotante({ ancla, flotante, className, children, ...props }: Omit<React.HTMLAttributes<HTMLDivElement>, 'style' | 'onMouseDown'> & {
    ancla: React.RefObject<HTMLElement | null>;
    flotante: ReturnType<typeof useFlotante>;
}): React.ReactPortal | null;
/** Sets a form control's value the way the browser does, so React's `onChange` and the form see a real change. */
export declare function escribirValor(control: HTMLInputElement | HTMLSelectElement, valor: string): void;
/** Lowercase and without accents, to compare what someone types with an option. */
export declare function plegar(texto: string): string;
export {};
