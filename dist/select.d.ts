import * as React from "react";
/**
 * `campo`: the Portal's form field. `pastilla`: a compact uppercase pill for a
 * data-grid cell; it brings neutral colours, the app passes its own in
 * `className` (`bg-ok-soft text-ok border-ok-border`).
 */
export type VarianteDeSelect = "campo" | "pastilla";
export type SelectProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value" | "defaultValue" | "onChange" | "type" | "name" | "form"> & Pick<React.SelectHTMLAttributes<HTMLSelectElement>, "value" | "defaultValue" | "onChange" | "name" | "form" | "required" | "autoComplete"> & {
    defaultOpen?: boolean;
    variante?: VarianteDeSelect;
};
/**
 * The Portal's select: a drop-in `<select>` (same `<option>`/`<optgroup>`
 * children, `value`/`defaultValue`, `onChange(event)`, `name`, `form`,
 * `required`) whose open list is ours on every device. A hidden native
 * `<select>` keeps the value, posts it with the form, validates `required` and
 * fires the real `change` event. The list goes to `<body>` with fixed
 * positioning, above the `Marco` drawer and the modals.
 */
export declare function Select({ className, children, value, defaultValue, onChange, name, required, form, autoComplete, disabled, autoFocus, defaultOpen, variante, onKeyDown, onBlur, ...buttonProps }: SelectProps): React.JSX.Element;
/** Alias of `Select`. v0.6.0's `Selector` props (`valor`, `onCambiar`, `opciones`) are gone. */
export declare const Selector: typeof Select;
