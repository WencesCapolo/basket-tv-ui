/** Portal UserProfileChip without the photo upload: name, role and initials. */
export declare function ChipDeUsuario({ nombre, rol }: {
    nombre: string;
    rol: string;
}): import("react").JSX.Element;
/** The first letter of the first two words, or a dot for an empty name. */
export declare function inicialesDe(nombre: string): string;
