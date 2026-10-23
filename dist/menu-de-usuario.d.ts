/**
 * The user in the header. From sm up it is `ChipDeUsuario` plus
 * `BotonDeSalir`; below sm only the initials fit, and they open a menu with
 * the name, the role, "Elegir aplicación" and "Cerrar sesión".
 */
export declare function MenuDeUsuario({ nombre, rol, salirUrl, lanzadorUrl, }: {
    nombre: string;
    rol: string;
    /** `${portalUrl}/logout`, as in `BotonDeSalir`. */
    salirUrl: string;
    /** The Portal's app launcher; without it the menu has no "Elegir aplicación". */
    lanzadorUrl?: string | null;
}): import("react").JSX.Element;
