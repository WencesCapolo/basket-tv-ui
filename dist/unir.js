/** Joins class names, dropping the falsy ones. Same job as the Portal's `cn`. */
export function unir(...clases) {
    return clases.filter(Boolean).join(' ');
}
