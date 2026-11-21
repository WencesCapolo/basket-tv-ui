import type * as React from 'react';
/** `campo`: the Portal's form field. `compacto`: a field in a data-grid cell. */
export type VarianteDeCampo = 'campo' | 'compacto';
/** The look every field shares, by variant: `Campo`, `AreaDeTexto` and the buttons of `Select` and `CampoDeFecha`. */
export declare const CLASES_DE_CAMPO: Record<VarianteDeCampo, string>;
export type CampoProps = Omit<React.ComponentProps<'input'>, 'type'> & {
    type?: 'text' | 'number' | 'email' | 'password' | 'search' | 'tel' | 'url';
    variante?: VarianteDeCampo;
};
/** The Portal's `Input`. Dates go in `CampoDeFecha`, checkboxes in `Casilla`, files in `CampoDeArchivo`. */
export declare function Campo({ className, variante, type, ...props }: CampoProps): React.JSX.Element;
export type AreaDeTextoProps = React.ComponentProps<'textarea'> & {
    variante?: VarianteDeCampo;
};
/** The Portal's `Textarea`. */
export declare function AreaDeTexto({ className, variante, ...props }: AreaDeTextoProps): React.JSX.Element;
