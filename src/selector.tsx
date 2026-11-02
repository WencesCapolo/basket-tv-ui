'use client';

import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent as EventoDeTeclado,
} from 'react';
import { createPortal } from 'react-dom';
import { Icono } from './iconos.js';
import { unir } from './unir.js';

export interface OpcionDeSelector {
  readonly valor: string;
  readonly etiqueta: string;
  readonly deshabilitada?: boolean;
}

/**
 * `campo`: the form control (h-11, surface, border, panel radius).
 * `pastilla`: a compact uppercase pill for a grid cell; it brings no colours,
 * the app passes them in `className` (`bg-ok-soft text-ok border border-ok-border`).
 */
export type VarianteDeSelector = 'campo' | 'pastilla';

export interface PropsDelSelector {
  valor: string;
  onCambiar: (valor: string) => void;
  opciones: readonly OpcionDeSelector[];
  /** An extra first option with value `''`, e.g. "Todos los períodos". */
  placeholder?: string;
  /** Goes on the control, so `<label htmlFor>` names it. */
  id?: string;
  /** Posted with the form: a hidden input on desktop, the `<select>` itself on phones. */
  name?: string;
  invalido?: boolean;
  deshabilitado?: boolean;
  variante?: VarianteDeSelector;
  /** On the outer box: width, grid placement and, for `pastilla`, the colours. */
  className?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

const ESTILOS: Record<VarianteDeSelector, { caja: string; control: string; flecha: string }> = {
  campo: {
    caja: '',
    control:
      'h-11 rounded-[var(--panel-radius)] border border-[var(--border)] bg-[var(--surface)] pl-3 pr-9 text-sm text-[var(--foreground)] transition hover:border-[var(--n-300)] aria-[invalid=true]:border-[var(--accent)]',
    flecha: 'right-3 text-[var(--muted)]',
  },
  pastilla: {
    caja: 'rounded-full',
    control: 'h-7 rounded-full bg-transparent pl-3 pr-7 text-[11px] font-black uppercase tracking-[0.12em] text-inherit',
    flecha: 'right-2 size-3.5 text-current',
  },
};

const BASE_DEL_CONTROL =
  'w-full min-w-0 appearance-none text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60';

/**
 * A controlled select with our own options list.
 *
 * With a fine pointer (mouse, trackpad) it is a button and a listbox panel,
 * the WAI-ARIA APG "select-only combobox": click, Enter, Space or the arrows
 * open it; arrows, Home and End move; Enter or Space choose; Escape closes and
 * Tab leaves; typing jumps to the first label that starts with what was typed.
 * The panel goes to `<body>`, so no `overflow` container nor modal clips it.
 *
 * With a coarse pointer (phones) it renders a native `<select>` with the same
 * closed look, so the OS picker is used. The server and the hydration pass
 * render the native one too; a fine pointer swaps it right after.
 *
 * Migrating from `<select value onChange>`: the options become `opciones`,
 * an empty first option becomes `placeholder`, `onChange` becomes
 * `onCambiar(valor)`, and `name` keeps posting with the form.
 */
export function Selector({
  valor,
  onCambiar,
  opciones,
  placeholder,
  id,
  name,
  invalido = false,
  deshabilitado = false,
  variante = 'campo',
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
}: PropsDelSelector) {
  const nativo = useSyncExternalStore(suscribirseAlPuntero, punteroGrueso, enElServidor);
  const todas = useMemo<readonly OpcionDeSelector[]>(
    () => (placeholder === undefined ? opciones : [{ valor: '', etiqueta: placeholder }, ...opciones]),
    [opciones, placeholder],
  );
  const estilos = ESTILOS[variante];
  const comunes = {
    id,
    disabled: deshabilitado,
    'aria-invalid': invalido || undefined,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    className: unir(BASE_DEL_CONTROL, estilos.control),
  };

  return (
    <span className={unir('relative inline-flex min-w-0 align-middle', estilos.caja, className)}>
      {nativo ? (
        <>
          <select {...comunes} name={name} value={valor} onChange={(evento) => onCambiar(evento.target.value)}>
            {todas.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor} disabled={opcion.deshabilitada}>
                {opcion.etiqueta}
              </option>
            ))}
          </select>
          <Flecha clase={estilos.flecha} />
        </>
      ) : (
        <SelectorPropio
          comunes={comunes}
          todas={todas}
          valor={valor}
          onCambiar={onCambiar}
          name={name}
          deshabilitado={deshabilitado}
          clasesDeLaFlecha={estilos.flecha}
        />
      )}
    </span>
  );
}

function Flecha({ clase, abierta = false }: { clase: string; abierta?: boolean }) {
  return (
    <Icono
      nombre="abajo"
      className={unir(
        'pointer-events-none absolute top-1/2 -translate-y-1/2 transition-transform',
        abierta && 'rotate-180',
        clase,
      )}
    />
  );
}

// El puntero decide: un mouse usa nuestra lista; un dedo, el selector del sistema,
// que en el celular es mejor que cualquier panel. En el servidor no hay puntero:
// sale el nativo, que anda en todos lados, y después de hidratar se corrige.
const PUNTERO_GRUESO = '(pointer: coarse)';

function suscribirseAlPuntero(avisar: () => void) {
  if (typeof window.matchMedia !== 'function') return () => {};
  const consulta = window.matchMedia(PUNTERO_GRUESO);
  consulta.addEventListener?.('change', avisar);
  return () => consulta.removeEventListener?.('change', avisar);
}

function punteroGrueso() {
  return typeof window.matchMedia === 'function' && window.matchMedia(PUNTERO_GRUESO).matches;
}

function enElServidor() {
  return true;
}

const ALTURA_MAXIMA = 288;
const MARGEN = 8;
const SEPARACION = 4;
const PAUSA_DE_BUSQUEDA = 500;


function SelectorPropio({
  comunes,
  todas,
  valor,
  onCambiar,
  name,
  deshabilitado,
  clasesDeLaFlecha,
}: {
  comunes: {
    id?: string;
    disabled: boolean;
    'aria-invalid'?: boolean;
    'aria-label'?: string;
    'aria-labelledby'?: string;
    className: string;
  };
  todas: readonly OpcionDeSelector[];
  valor: string;
  onCambiar: (valor: string) => void;
  name?: string;
  deshabilitado: boolean;
  clasesDeLaFlecha: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const [activa, setActiva] = useState(-1);
  const [posicion, setPosicion] = useState<CSSProperties | null>(null);
  const control = useRef<HTMLButtonElement>(null);
  const lista = useRef<HTMLUListElement>(null);
  const busqueda = useRef({ texto: '', hasta: 0 });
  const base = useId();
  const idDeLista = `${base}lista`;
  const idDeOpcion = (indice: number) => `${base}opcion-${indice}`;

  const indiceElegido = todas.findIndex((opcion) => opcion.valor === valor);
  const elegida = todas[indiceElegido];
  const habilitada = (indice: number) => indice >= 0 && indice < todas.length && !todas[indice]?.deshabilitada;

  // Sin dar la vuelta, como pide el APG: en la última, ↓ se queda.
  const mover = (desde: number, paso: 1 | -1) => {
    for (let indice = desde + paso; indice >= 0 && indice < todas.length; indice += paso) {
      if (habilitada(indice)) return indice;
    }
    return desde;
  };
  const primera = () => mover(-1, 1);
  const ultima = () => mover(todas.length, -1);

  const abrir = (indice?: number) => {
    setActiva(indice ?? (habilitada(indiceElegido) ? indiceElegido : primera()));
    setPosicion(null);
    setAbierto(true);
  };
  const cerrar = (devolverFoco = true) => {
    setAbierto(false);
    if (devolverFoco) control.current?.focus();
  };
  const elegir = (indice: number) => {
    const opcion = todas[indice];
    if (!opcion || opcion.deshabilitada) return;
    if (opcion.valor !== valor) onCambiar(opcion.valor);
    cerrar();
  };

  // Las letras se juntan mientras se teclea seguido; la misma letra repetida
  // recorre las opciones que empiezan con ella.
  const buscar = (caracter: string) => {
    const ahora = Date.now();
    const estado = busqueda.current;
    estado.texto = ahora < estado.hasta ? estado.texto + caracter : caracter;
    estado.hasta = ahora + PAUSA_DE_BUSQUEDA;
    const texto = normalizar(estado.texto);
    const repetida = [...texto].every((letra) => letra === texto[0]);
    const buscado = repetida ? texto.slice(0, 1) : texto;
    const desde = abierto ? activa : indiceElegido;
    const inicio = repetida ? desde + 1 : Math.max(desde, 0);
    for (let paso = 0; paso < todas.length; paso++) {
      const indice = (inicio + paso) % todas.length;
      if (habilitada(indice) && normalizar(todas[indice]!.etiqueta).startsWith(buscado)) return indice;
    }
    return -1;
  };
  const buscando = () => Date.now() < busqueda.current.hasta;

  const alTeclear = (evento: EventoDeTeclado<HTMLButtonElement>) => {
    const { key: tecla, altKey, ctrlKey, metaKey } = evento;
    const imprimible = tecla.length === 1 && !ctrlKey && !metaKey && !altKey;

    if (!abierto) {
      if (tecla === 'ArrowDown' || tecla === 'ArrowUp' || tecla === 'Enter' || tecla === ' ') {
        evento.preventDefault();
        abrir();
      } else if (tecla === 'Home' || tecla === 'End') {
        evento.preventDefault();
        abrir(tecla === 'Home' ? primera() : ultima());
      } else if (imprimible) {
        evento.preventDefault();
        const indice = buscar(tecla);
        abrir(indice >= 0 ? indice : undefined);
      }
      return;
    }

    switch (tecla) {
      case 'ArrowDown':
        evento.preventDefault();
        setActiva(mover(activa, 1));
        return;
      case 'ArrowUp':
        evento.preventDefault();
        if (altKey) elegir(activa);
        else setActiva(mover(activa, -1));
        return;
      case 'Home':
      case 'End':
        evento.preventDefault();
        setActiva(tecla === 'Home' ? primera() : ultima());
        return;
      case 'Enter':
        evento.preventDefault();
        elegir(activa);
        return;
      case 'Escape':
        // Que no llegue al document: un modal abajo se cerraría con el mismo Escape.
        evento.preventDefault();
        evento.stopPropagation();
        cerrar();
        return;
      case 'Tab':
        cerrar(false);
        return;
    }
    if (tecla === ' ' && !buscando()) {
      evento.preventDefault();
      elegir(activa);
    } else if (imprimible) {
      evento.preventDefault();
      const indice = buscar(tecla);
      if (indice >= 0) setActiva(indice);
    }
  };

  // Afuera es afuera del botón y del panel (que vive en <body>).
  useEffect(() => {
    if (!abierto) return;
    const alTocarAfuera = (evento: PointerEvent) => {
      const objetivo = evento.target as Node;
      if (control.current?.contains(objetivo) || lista.current?.contains(objetivo)) return;
      setAbierto(false);
    };
    document.addEventListener('pointerdown', alTocarAfuera);
    return () => document.removeEventListener('pointerdown', alTocarAfuera);
  }, [abierto]);

  // Fijo en <body>, pegado al botón: abajo si entra, si no arriba si hay más lugar.
  useLayoutEffect(() => {
    if (!abierto) return;
    const colocar = () => {
      const boton = control.current;
      const panel = lista.current;
      if (!boton || !panel) return;
      const caja = boton.getBoundingClientRect();
      const alto = Math.min(panel.scrollHeight, ALTURA_MAXIMA);
      const abajo = window.innerHeight - caja.bottom - SEPARACION - MARGEN;
      const encima = caja.top - SEPARACION - MARGEN;
      const arriba = abajo < alto && encima > abajo;
      const ancho = Math.max(caja.width, panel.offsetWidth);
      const izquierda = Math.max(MARGEN, Math.min(caja.left, window.innerWidth - MARGEN - ancho));
      setPosicion({
        position: 'fixed',
        left: izquierda,
        minWidth: caja.width,
        maxWidth: window.innerWidth - 2 * MARGEN,
        maxHeight: Math.max(Math.min(ALTURA_MAXIMA, arriba ? encima : abajo), 0),
        ...(arriba ? { bottom: window.innerHeight - caja.top + SEPARACION } : { top: caja.bottom + SEPARACION }),
      });
    };
    colocar();
    window.addEventListener('resize', colocar);
    window.addEventListener('scroll', colocar, true);
    return () => {
      window.removeEventListener('resize', colocar);
      window.removeEventListener('scroll', colocar, true);
    };
  }, [abierto]);

  // La activa siempre a la vista, moviendo solo el panel (no la página).
  useEffect(() => {
    if (!abierto || !posicion) return;
    const panel = lista.current;
    const opcion = document.getElementById(idDeOpcion(activa));
    if (!panel || !opcion) return;
    if (opcion.offsetTop < panel.scrollTop) panel.scrollTop = opcion.offsetTop;
    else if (opcion.offsetTop + opcion.offsetHeight > panel.scrollTop + panel.clientHeight)
      panel.scrollTop = opcion.offsetTop + opcion.offsetHeight - panel.clientHeight;
    // idDeOpcion depende solo de `base`, que no cambia.
  }, [abierto, activa, posicion]);

  const etiquetaDeLista = comunes['aria-labelledby']
    ? { 'aria-labelledby': comunes['aria-labelledby'] }
    : comunes['aria-label']
      ? { 'aria-label': comunes['aria-label'] }
      : {};

  return (
    <>
      <button
        {...comunes}
        ref={control}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-controls={idDeLista}
        aria-activedescendant={abierto && activa >= 0 ? idDeOpcion(activa) : undefined}
        onClick={() => (abierto ? cerrar() : abrir())}
        onKeyDown={alTeclear}
        // Space activa los botones al soltarla: sin esto, Firefox reabriría la lista.
        onKeyUp={(evento) => evento.key === ' ' && evento.preventDefault()}
        onBlur={(evento) => {
          if (!lista.current?.contains(evento.relatedTarget as Node | null)) setAbierto(false);
        }}
      >
        <span className="block truncate">{elegida?.etiqueta ?? '\u00a0'}</span>
      </button>
      <Flecha clase={clasesDeLaFlecha} abierta={abierto} />
      {name && <input type="hidden" name={name} value={valor} disabled={deshabilitado} />}
      {abierto &&
        createPortal(
          <ul
            ref={lista}
            id={idDeLista}
            role="listbox"
            tabIndex={-1}
            {...etiquetaDeLista}
            // Mantiene el foco en el botón al tocar una opción o la barra de scroll.
            onMouseDown={(evento) => evento.preventDefault()}
            style={posicion ?? { position: 'fixed', top: 0, left: 0, visibility: 'hidden' }}
            className="z-[110] overflow-y-auto rounded-[var(--panel-radius)] border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-[var(--shadow-lift)] outline-none"
          >
            {todas.map((opcion, indice) => {
              const esLaElegida = indice === indiceElegido;
              return (
                <li
                  key={opcion.valor}
                  id={idDeOpcion(indice)}
                  role="option"
                  aria-selected={esLaElegida}
                  aria-disabled={opcion.deshabilitada || undefined}
                  onMouseMove={() => habilitada(indice) && indice !== activa && setActiva(indice)}
                  onClick={() => elegir(indice)}
                  className={unir(
                    'flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-[var(--foreground)]',
                    indice === activa && 'bg-[var(--background-soft)]',
                    opcion.deshabilitada && 'cursor-not-allowed opacity-50',
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">{opcion.etiqueta}</span>
                  <Icono nombre="elegida" className={unir('size-4 text-[var(--accent)]', !esLaElegida && 'invisible')} />
                </li>
              );
            })}
          </ul>,
          document.body,
        )}
    </>
  );
}

function normalizar(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}
