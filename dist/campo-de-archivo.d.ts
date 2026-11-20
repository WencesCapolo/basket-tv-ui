import * as React from 'react';
export type CampoDeArchivoProps = {
    /** Called with the file chosen with the button or dropped on the zone. The input is emptied after, so the same file can come again. */
    onArchivo: (archivo: File) => void;
    /** What it takes, as in `<input accept>`: `.xlsx,.csv`. */
    accept?: string;
    /** The button's text. */
    boton: React.ReactNode;
    /** The zone's text, above the button. */
    children?: React.ReactNode;
    disabled?: boolean;
    className?: string;
};
/** A dashed zone to drop a file on, with a button that opens the system's file picker. */
export declare function CampoDeArchivo({ onArchivo, accept, boton, children, disabled, className }: CampoDeArchivoProps): React.JSX.Element;
