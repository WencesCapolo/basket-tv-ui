import * as React from 'react';
import { type VarianteDeCampo } from './campo.js';
export type CampoDeFechaProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'defaultValue' | 'onChange' | 'type' | 'name' | 'form' | 'children'> & Pick<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'name' | 'form' | 'required'> & {
    /** `AAAA-MM-DD`, or `''` for none. */
    value?: string;
    defaultValue?: string;
    /** `AAAA-MM-DD`: days before it can't be chosen. */
    min?: string;
    /** `AAAA-MM-DD`: days after it can't be chosen. */
    max?: string;
    /** Shown while it has no date. */
    placeholder?: string;
    variante?: VarianteDeCampo;
};
/**
 * A date field with our own calendar, on every device. Used like
 * `<input type="date">`: `value`/`defaultValue` and `onChange(event)` with
 * `e.target.value` as `AAAA-MM-DD`, `min`, `max`, `name`, `form`, `required`.
 * A hidden native date input keeps the value, posts it and validates it.
 */
export declare function CampoDeFecha({ value, defaultValue, onChange, name, form, required, min, max, placeholder, variante, className, disabled, onKeyDown, onBlur, ...botonProps }: CampoDeFechaProps): React.JSX.Element;
