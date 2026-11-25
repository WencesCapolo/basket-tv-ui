import * as React from 'react';
import { type VarianteDeCampo } from './campo.js';
export type CampoDeMesProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'defaultValue' | 'onChange' | 'type' | 'name' | 'form' | 'children'> & Pick<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'name' | 'form' | 'required'> & {
    /** `AAAA-MM`, or `''` for none. */
    value?: string;
    defaultValue?: string;
    /** `AAAA-MM`: months before it can't be chosen. */
    min?: string;
    /** `AAAA-MM`: months after it can't be chosen. */
    max?: string;
    /** Shown while it has no month. */
    placeholder?: string;
    variante?: VarianteDeCampo;
};
/**
 * A month field with our own picker, on every device. Used like
 * `<input type="month">`: `value`/`defaultValue` and `onChange(event)` with
 * `e.target.value` as `AAAA-MM`, `min`, `max`, `name`, `form`, `required`.
 * A hidden native month input keeps the value, posts it and validates it.
 */
export declare function CampoDeMes({ value, defaultValue, onChange, name, form, required, min, max, placeholder, variante, className, disabled, onKeyDown, onBlur, ...botonProps }: CampoDeMesProps): React.JSX.Element;
