import { type AnchorHTMLAttributes, type ComponentType, type ReactNode } from 'react';
export interface EnlaceDeNavegacion {
    readonly clave: string;
    readonly titulo: string;
    /** Each app brings its own icon (lucide, inline SVG…), sized by the nav. */
    readonly icono: ReactNode;
    readonly href: string;
    readonly activa: boolean;
    /** Navigates without reloading; a ctrl-click still opens a new tab. */
    readonly onElegir?: () => void;
}
/** A plain `<a>` by default; a Next app passes `next/link`. */
export type ComponenteDeEnlace = ComponentType<AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
}>;
declare const ANCHOS: {
    readonly normal: "max-w-6xl";
    readonly amplio: "max-w-none";
};
/**
 * The shell every basket-app.com app shares: the navy sidebar with the brand,
 * the sections and "Elegir aplicación" (collapsible, a drawer below lg); the
 * sticky header with "Volver" to the launcher and the user; and the page.
 */
export declare function Marco({ children, nombreDeApp, secciones, lanzadorUrl, cabecera, ancho, enlace, logo, logoEnCabecera, }: {
    children: ReactNode;
    /** Under the logo, in the sidebar: "Incidencias", "Facturación"… */
    nombreDeApp: string;
    secciones?: readonly EnlaceDeNavegacion[];
    /** The Portal's app launcher. Without it there is no Volver nor Elegir aplicación. */
    lanzadorUrl?: string | null;
    /** The right side of the header: the user chip, a bell, logout. */
    cabecera?: ReactNode;
    ancho?: keyof typeof ANCHOS;
    enlace?: ComponenteDeEnlace;
    /** White logo, for the navy sidebar. */
    logo?: string;
    /** Red logo, for the white header below lg. */
    logoEnCabecera?: string;
}): import("react").JSX.Element;
/** Portal's ghost logout button, as a link: the Portal ends the shared session. */
export declare function BotonDeSalir({ href, enlace: Enlace }: {
    href: string;
    enlace?: ComponenteDeEnlace;
}): import("react").JSX.Element;
export {};
