import * as React from 'react';
import { type CampoProps } from './campo.js';
export type CampoConSugerenciasProps = Omit<CampoProps, 'list' | 'type'> & {
    /** What the list offers. The person can still write anything else. */
    sugerencias: readonly string[];
};
/**
 * A text field that offers `sugerencias` in our own list while the person
 * writes: the ones that contain what they wrote, ignoring accents and case.
 * Replaces `<input list>` + `<datalist>`. Same props as `Campo`; choosing one
 * fires the real `change` event, so `onChange` reads `e.target.value`.
 */
export declare function CampoConSugerencias({ sugerencias, value, defaultValue, onChange, onFocus, onBlur, onKeyDown, ref, ...props }: CampoConSugerenciasProps): React.JSX.Element;
