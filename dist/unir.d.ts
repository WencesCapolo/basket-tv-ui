/**
 * Joins class names, dropping the falsy ones, and resolves Tailwind conflicts
 * like the Portal's `cn` (tailwind-merge): the last class wins, so an app's
 * `className` overrides the component's own (`rounded-xl` beats
 * `rounded-[var(--panel-radius)]`, `size-4` beats `size-[18px]`).
 */
export declare function unir(...clases: Array<string | false | null | undefined>): string;
