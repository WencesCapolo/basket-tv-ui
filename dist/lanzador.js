const DOMINIOS_DEL_PORTAL = ['basket-app.com', 'basket-app.localhost'];
/**
 * El selector de aplicaciones del Portal vive en el apex de su dominio:
 * `https://portal.basket-app.com` lleva a `https://basket-app.com`. Fuera de
 * esos dominios no hay selector y devuelve null.
 */
export function urlDelLanzador(portalUrl) {
    let url;
    try {
        url = new URL(portalUrl);
    }
    catch {
        return null;
    }
    const apex = DOMINIOS_DEL_PORTAL.find((d) => url.hostname === d || url.hostname.endsWith(`.${d}`));
    if (!apex)
        return null;
    const puerto = url.port ? `:${url.port}` : '';
    return `${url.protocol}//${apex}${puerto}`;
}
/**
 * El formulario de Solicitud de acceso vive en el Portal para todas las apps;
 * `app` dice cuál se pide. Quien entra a una app sin Acceso va acá.
 */
export function urlDeSolicitud(portalUrl, app) {
    return `${portalUrl.replace(/\/+$/, '')}/no-access?app=${encodeURIComponent(app)}`;
}
