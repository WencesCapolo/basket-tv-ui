import { type ReactNode } from 'react';
export interface OpcionDeRol {
    readonly valor: string;
    readonly etiqueta: string;
}
export interface SolicitudPendiente {
    readonly id: string;
    /** The app key the Solicitud asks for (`auth_app.key`), posted back as `app`. */
    readonly app: string;
    /** The badge: "Facturación", "Portal"… */
    readonly nombreDeApp: string;
    readonly nombre: string;
    readonly email: string;
    readonly telefono?: string | null;
    readonly funcion?: string | null;
    readonly ciudad?: string | null;
    readonly mensaje?: string | null;
    /** The roles the viewer may grant in `app`. Empty: the viewer can only reject. */
    readonly roles: readonly OpcionDeRol[];
    /** Replaces the role picker, e.g. the apex passes the Portal's own form for portal items. */
    readonly decision?: ReactNode;
}
/** A server action (or any form action) that receives the decision form. */
export type AccionDeFormulario = (datos: FormData) => void | Promise<void>;
/**
 * The bell with the pending count and its modal. UI only: each app loads the
 * Solicitudes it may decide and passes its own `aprobar` / `rechazar`. Both
 * forms post `solicitudId` and `app`; `aprobar` also posts `rol`. Hidden
 * fields in `camposOcultos` (a return path, say) go with both.
 */
export declare function CampanaDeSolicitudes({ solicitudes, aprobar, rechazar, camposOcultos, }: {
    solicitudes: readonly SolicitudPendiente[];
    aprobar: AccionDeFormulario;
    rechazar: AccionDeFormulario;
    camposOcultos?: Readonly<Record<string, string>>;
}): import("react").JSX.Element;
