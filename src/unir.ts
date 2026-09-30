/** Joins class names, dropping the falsy ones. Same job as the Portal's `cn`. */
export function unir(...clases: Array<string | false | null | undefined>): string {
  return clases.filter(Boolean).join(' ');
}
