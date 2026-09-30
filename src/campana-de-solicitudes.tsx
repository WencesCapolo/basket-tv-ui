'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal, useFormStatus } from 'react-dom';
import { retenerFoco } from './foco';
import { Icono } from './iconos';
import { unir } from './unir';

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

// Se abre sola una vez por conjunto de pendientes y por pestaña. Cerrarla es
// local: no toca ninguna Solicitud, así que nadie más deja de verla.
const PREFIJO_DE_ABIERTAS = 'basket-tv-ui.solicitudes.abiertas:';

/**
 * The bell with the pending count and its modal. UI only: each app loads the
 * Solicitudes it may decide and passes its own `aprobar` / `rechazar`. Both
 * forms post `solicitudId` and `app`; `aprobar` also posts `rol`. Hidden
 * fields in `camposOcultos` (a return path, say) go with both.
 */
export function CampanaDeSolicitudes({
  solicitudes,
  aprobar,
  rechazar,
  camposOcultos = {},
}: {
  solicitudes: readonly SolicitudPendiente[];
  aprobar: AccionDeFormulario;
  rechazar: AccionDeFormulario;
  camposOcultos?: Readonly<Record<string, string>>;
}) {
  const [abierta, setAbierta] = useState(false);
  const cerrar = useCallback(() => setAbierta(false), []);
  const cantidad = solicitudes.length;
  const version = useMemo(() => solicitudes.map((s) => s.id).join('|'), [solicitudes]);

  useEffect(() => {
    if (!version) return;
    const clave = `${PREFIJO_DE_ABIERTAS}${version}`;
    try {
      if (window.sessionStorage.getItem(clave)) return;
      window.sessionStorage.setItem(clave, '1');
    } catch {
      // Sin storage se vuelve a abrir en la próxima navegación.
    }
    setAbierta(true);
  }, [version]);

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierta(true)}
        aria-label={cantidad ? `Solicitudes de acceso pendientes: ${cantidad}` : 'Solicitudes de acceso'}
        aria-haspopup="dialog"
        className={unir(
          'relative inline-flex size-11 items-center justify-center rounded-2xl bg-[var(--surface)] text-[var(--n-700)] transition hover:bg-[var(--background-soft)] hover:text-[var(--foreground)]',
          !cantidad && 'opacity-70',
        )}
      >
        <Icono nombre="solicitudes" className="size-5" />
        {cantidad > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-[var(--accent)] px-1.5 text-[11px] font-black text-white">
            {cantidad}
          </span>
        )}
      </button>
      {abierta && (
        <ModalDeSolicitudes
          solicitudes={solicitudes}
          aprobar={aprobar}
          rechazar={rechazar}
          camposOcultos={camposOcultos}
          alCerrar={cerrar}
        />
      )}
    </>
  );
}

// Va a <body>: el backdrop-blur del encabezado atraparía el overlay fijo.
function ModalDeSolicitudes({
  solicitudes,
  aprobar,
  rechazar,
  camposOcultos,
  alCerrar,
}: {
  solicitudes: readonly SolicitudPendiente[];
  aprobar: AccionDeFormulario;
  rechazar: AccionDeFormulario;
  camposOcultos: Readonly<Record<string, string>>;
  alCerrar: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const idDelTitulo = useId();
  // null es "todas cerradas"; un id que ya no está (se resolvió) vuelve a la primera.
  const [elegida, setElegida] = useState<string | null>(solicitudes[0]?.id ?? null);
  const expandida = elegida === null || solicitudes.some((s) => s.id === elegida) ? elegida : (solicitudes[0]?.id ?? null);
  const cantidad = solicitudes.length;

  useEffect(() => {
    const antes = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panel.current?.querySelector<HTMLElement>('button')?.focus();
    const desborde = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const alTeclear = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') alCerrar();
      if (evento.key === 'Tab' && panel.current) retenerFoco(evento, panel.current);
    };
    document.addEventListener('keydown', alTeclear);
    return () => {
      document.body.style.overflow = desborde;
      document.removeEventListener('keydown', alTeclear);
      antes?.focus();
    };
  }, [alCerrar]);

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-[rgba(28,13,16,0.6)] p-4 backdrop-blur-sm"
      onClick={alCerrar}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idDelTitulo}
        className="relative my-8 w-full max-w-2xl rounded-[var(--panel-radius)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lift)]"
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-6 py-5">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--accent)]">Solicitudes</p>
            <h3 id={idDelTitulo} className="mt-1 text-2xl font-extrabold tracking-[-0.03em] text-[var(--foreground)]">
              {cantidad
                ? `${cantidad} solicitud${cantidad === 1 ? '' : 'es'} pendiente${cantidad === 1 ? '' : 's'}`
                : 'No hay solicitudes pendientes'}
            </h3>
          </div>
          <button
            type="button"
            onClick={alCerrar}
            aria-label="Cerrar solicitudes"
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--background-soft)] text-[var(--n-400)] transition hover:bg-[var(--n-100)] hover:text-[var(--n-700)]"
          >
            <Icono nombre="cerrar" className="size-4" />
          </button>
        </div>

        <ul className="divide-y divide-[var(--border)]">
          {solicitudes.map((solicitud) => {
            const abierta = expandida === solicitud.id;
            return (
              <li key={solicitud.id} className="px-6 py-4">
                <button
                  type="button"
                  onClick={() => setElegida(abierta ? null : solicitud.id)}
                  aria-expanded={abierta}
                  className="flex w-full items-center justify-between gap-4 text-left"
                >
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-base font-extrabold text-[var(--foreground)]">{solicitud.nombre}</span>
                      <InsigniaDeApp nombre={solicitud.nombreDeApp} />
                    </span>
                    <span className="block truncate text-sm text-[var(--n-500)]">
                      {[solicitud.funcion, solicitud.email].filter(Boolean).join(' · ')}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs font-black uppercase tracking-[0.16em] text-[var(--accent)]">
                    {abierta ? 'Cerrar' : 'Revisar'}
                  </span>
                </button>
                {abierta && (
                  <div className="mt-4">
                    {solicitud.decision ?? (
                      <DecisionPorRol
                        solicitud={solicitud}
                        aprobar={aprobar}
                        rechazar={rechazar}
                        camposOcultos={camposOcultos}
                      />
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        {!cantidad && (
          <p className="px-6 py-6 text-sm text-[var(--n-500)]">Cuando alguien se registre, su solicitud aparece acá.</p>
        )}
      </div>
    </div>,
    document.body,
  );
}

function InsigniaDeApp({ nombre }: { nombre: string }) {
  return (
    <span className="shrink-0 rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--accent-strong)]">
      {nombre}
    </span>
  );
}

function DecisionPorRol({
  solicitud,
  aprobar,
  rechazar,
  camposOcultos,
}: {
  solicitud: SolicitudPendiente;
  aprobar: AccionDeFormulario;
  rechazar: AccionDeFormulario;
  camposOcultos: Readonly<Record<string, string>>;
}) {
  const idDelRol = useId();
  const ocultos = (
    <>
      <input type="hidden" name="solicitudId" value={solicitud.id} />
      <input type="hidden" name="app" value={solicitud.app} />
      {Object.entries(camposOcultos).map(([nombre, valor]) => (
        <input key={nombre} type="hidden" name={nombre} value={valor} />
      ))}
    </>
  );
  // Con un solo rol posible no hay nada que elegir; con varios, se elige a propósito.
  const unico = solicitud.roles.length === 1 ? solicitud.roles[0]?.valor : undefined;

  return (
    <div className="space-y-4 rounded-[var(--panel-radius)] border border-[var(--border)] bg-[var(--background-soft)] p-4">
      <dl className="space-y-1 text-sm">
        <Fila etiqueta="App" valor={solicitud.nombreDeApp} />
        <Fila etiqueta="Email" valor={solicitud.email} />
        {solicitud.telefono && <Fila etiqueta="Teléfono" valor={solicitud.telefono} />}
        {solicitud.funcion && <Fila etiqueta="Función" valor={solicitud.funcion} />}
        {solicitud.ciudad && <Fila etiqueta="Ciudad" valor={solicitud.ciudad} />}
        {solicitud.mensaje && <Fila etiqueta="Mensaje" valor={solicitud.mensaje} />}
      </dl>

      {solicitud.roles.length > 0 ? (
        <form action={aprobar} className="flex flex-wrap items-end gap-3">
          {ocultos}
          <label htmlFor={idDelRol} className="flex min-w-48 flex-1 flex-col gap-1.5">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-[var(--n-500)]">Rol</span>
            <select
              id={idDelRol}
              name="rol"
              required
              defaultValue={unico ?? ''}
              className="h-11 rounded-[var(--panel-radius)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--foreground)]"
            >
              {!unico && (
                <option value="" disabled>
                  Elegí un rol
                </option>
              )}
              {solicitud.roles.map((rol) => (
                <option key={rol.valor} value={rol.valor}>
                  {rol.etiqueta}
                </option>
              ))}
            </select>
          </label>
          <BotonDeEnvio pendiente="Aprobando...">Aprobar</BotonDeEnvio>
        </form>
      ) : (
        <p className="text-sm text-[var(--n-500)]">No podés otorgar ningún rol de {solicitud.nombreDeApp}.</p>
      )}

      <form action={rechazar}>
        {ocultos}
        <BotonDeEnvio pendiente="Rechazando..." fantasma>
          Rechazar
        </BotonDeEnvio>
      </form>
    </div>
  );
}

function BotonDeEnvio({ children, pendiente, fantasma = false }: { children: ReactNode; pendiente: string; fantasma?: boolean }) {
  const { pending: enviando } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={enviando}
      className={unir(
        'inline-flex h-11 items-center justify-center rounded-[var(--panel-radius)] px-5 text-sm font-bold transition disabled:opacity-60',
        fantasma
          ? 'text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]'
          : 'bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)]',
      )}
    >
      {enviando ? pendiente : children}
    </button>
  );
}

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-20 shrink-0 text-xs font-black uppercase tracking-[0.14em] text-[var(--n-500)]">{etiqueta}</dt>
      <dd className="min-w-0 flex-1 text-[var(--foreground)]">{valor}</dd>
    </div>
  );
}
