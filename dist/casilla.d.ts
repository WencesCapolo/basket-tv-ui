import type * as React from 'react';
export type CasillaProps = Omit<React.ComponentProps<'input'>, 'type' | 'children'> & {
    /** The text beside the box. Without it, give the box an `aria-label` (a grid cell). */
    texto?: React.ReactNode;
};
/** A checkbox drawn with the tokens. A native `<input type="checkbox">` underneath: same props, form and keyboard. */
export declare function Casilla({ texto, className, disabled, ...props }: CasillaProps): React.JSX.Element;
