const ENFOCABLES = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])';

/** Keeps Tab and Shift+Tab inside `panel`, wrapping at both ends. */
export function retenerFoco(evento: KeyboardEvent, panel: HTMLElement) {
  const enfocables = [...panel.querySelectorAll<HTMLElement>(ENFOCABLES)];
  const primero = enfocables[0];
  const ultimo = enfocables[enfocables.length - 1];
  if (!primero || !ultimo) return;
  const activo = document.activeElement;
  if (evento.shiftKey && (activo === primero || !panel.contains(activo))) {
    evento.preventDefault();
    ultimo.focus();
  } else if (!evento.shiftKey && (activo === ultimo || !panel.contains(activo))) {
    evento.preventDefault();
    primero.focus();
  }
}
