import type { ComponenteDeEnlace, EnlaceDeNavegacion } from './marco.js';
export type SeccionParaVolver = Pick<EnlaceDeNavegacion, 'href' | 'activa' | 'onElegir'>;
export type DestinoDeVolver = {
    readonly tipo: 'lanzador';
    readonly href: string;
}
/** `href` is where to land when there is no page of the app to go back to. */
 | {
    readonly tipo: 'atras';
    readonly href: string;
    readonly seccion: SeccionParaVolver | null;
};
/**
 * Volver is the browser's back inside an app, and the launcher at its top.
 * The top is "/" and every section's own page, whatever its query: `/int?dia=…`
 * leads to the launcher, `/int/123` back to the list it came from.
 */
export declare function destinoDeVolver(url: string, secciones: readonly SeccionParaVolver[], lanzadorUrl: string): DestinoDeVolver;
/**
 * Whether going back stays in this app. The Navigation API only lists this
 * origin's entries, so arriving from the launcher (another origin) gives false.
 * Without it: a same-origin referrer, or a client navigation since `entrada`.
 */
export declare function hayAtrasEnLaApp(entrada: string): boolean;
export declare function BotonDeVolver({ lanzadorUrl, secciones, enlace: Enlace, className, }: {
    lanzadorUrl: string;
    secciones?: readonly SeccionParaVolver[];
    enlace: ComponenteDeEnlace;
    className?: string;
}): import("react").JSX.Element;
