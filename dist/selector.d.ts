export interface OpcionDeSelector {
    readonly valor: string;
    readonly etiqueta: string;
    readonly deshabilitada?: boolean;
}
/**
 * `campo`: the form control (h-11, surface, border, panel radius).
 * `pastilla`: a compact uppercase pill for a grid cell; it brings no colours,
 * the app passes them in `className` (`bg-ok-soft text-ok border border-ok-border`).
 */
export type VarianteDeSelector = 'campo' | 'pastilla';
export interface PropsDelSelector {
    valor: string;
    onCambiar: (valor: string) => void;
    opciones: readonly OpcionDeSelector[];
    /** An extra first option with value `''`, e.g. "Todos los períodos". */
    placeholder?: string;
    /** Goes on the control, so `<label htmlFor>` names it. */
    id?: string;
    /** Posted with the form: a hidden input on desktop, the `<select>` itself on phones. */
    name?: string;
    invalido?: boolean;
    deshabilitado?: boolean;
    variante?: VarianteDeSelector;
    /** On the outer box: width, grid placement and, for `pastilla`, the colours. */
    className?: string;
    'aria-label'?: string;
    'aria-labelledby'?: string;
}
/**
 * A controlled select with our own options list.
 *
 * With a fine pointer (mouse, trackpad) it is a button and a listbox panel,
 * the WAI-ARIA APG "select-only combobox": click, Enter, Space or the arrows
 * open it; arrows, Home and End move; Enter or Space choose; Escape closes and
 * Tab leaves; typing jumps to the first label that starts with what was typed.
 * The panel goes to `<body>`, so no `overflow` container nor modal clips it.
 *
 * With a coarse pointer (phones) it renders a native `<select>` with the same
 * closed look, so the OS picker is used. The server and the hydration pass
 * render the native one too; a fine pointer swaps it right after.
 *
 * Migrating from `<select value onChange>`: the options become `opciones`,
 * an empty first option becomes `placeholder`, `onChange` becomes
 * `onCambiar(valor)`, and `name` keeps posting with the form.
 */
export declare function Selector({ valor, onCambiar, opciones, placeholder, id, name, invalido, deshabilitado, variante, className, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledby, }: PropsDelSelector): import("react").JSX.Element;
