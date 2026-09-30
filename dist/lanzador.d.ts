/**
 * El selector de aplicaciones del Portal vive en el apex de su dominio:
 * `https://portal.basket-app.com` lleva a `https://basket-app.com`. Fuera de
 * esos dominios no hay selector y devuelve null.
 */
export declare function urlDelLanzador(portalUrl: string): string | null;
/**
 * El formulario de Solicitud de acceso vive en el Portal para todas las apps;
 * `app` dice cuál se pide. Quien entra a una app sin Acceso va acá.
 */
export declare function urlDeSolicitud(portalUrl: string, app: string): string;
