declare const TRAZOS: {
    readonly volver: import("react").JSX.Element;
    readonly menu: import("react").JSX.Element;
    readonly cerrar: import("react").JSX.Element;
    readonly aplicaciones: import("react").JSX.Element;
    readonly compactar: import("react").JSX.Element;
    readonly expandir: import("react").JSX.Element;
    readonly solicitudes: import("react").JSX.Element;
    readonly salir: import("react").JSX.Element;
};
export type NombreDeIcono = keyof typeof TRAZOS;
export declare function Icono({ nombre, className }: {
    nombre: NombreDeIcono;
    className?: string;
}): import("react").JSX.Element;
export {};
