'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type ComponentType,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { retenerFoco } from './foco.js';
import { Icono } from './iconos.js';
import { unir } from './unir.js';

export interface EnlaceDeNavegacion {
  readonly clave: string;
  readonly titulo: string;
  /** Each app brings its own icon (lucide, inline SVG…), sized by the nav. */
  readonly icono: ReactNode;
  readonly href: string;
  readonly activa: boolean;
  /** Navigates without reloading; a ctrl-click still opens a new tab. */
  readonly onElegir?: () => void;
}

/** A plain `<a>` by default; a Next app passes `next/link`. */
export type ComponenteDeEnlace = ComponentType<AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }>;

const TEXTO_VOLVER = 'Volver';
const TEXTO_DEL_LANZADOR = 'Elegir aplicación';
const CLAVE_DE_COMPACTA = 'basket-tv-ui.barra-lateral.compacta';
const ANCHOS = { normal: 'max-w-6xl', amplio: 'max-w-none' } as const;

const BOTON_SOBRE_NAVY =
  'inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-[var(--navy-control-line)] bg-[var(--navy-control)] text-[var(--navy-text)] transition hover:border-[var(--navy-control-hover)] hover:text-white';

/**
 * The shell every basket-app.com app shares: the navy sidebar with the brand,
 * the sections and "Elegir aplicación" (collapsible, a drawer below lg); the
 * sticky header with "Volver" to the launcher and the user; and the page.
 */
export function Marco({
  children,
  nombreDeApp,
  secciones = [],
  lanzadorUrl = null,
  cabecera,
  ancho = 'normal',
  enlace = EnlaceNativo,
  logo = '/basket-tv-horizontal-blanco.png',
  logoEnCabecera = '/basket-tv-horizontal-rojo.png',
}: {
  children: ReactNode;
  /** Under the logo, in the sidebar: "Incidencias", "Facturación"… */
  nombreDeApp: string;
  secciones?: readonly EnlaceDeNavegacion[];
  /** The Portal's app launcher. Without it there is no Volver nor Elegir aplicación. */
  lanzadorUrl?: string | null;
  /** The right side of the header: the user chip, a bell, logout. */
  cabecera?: ReactNode;
  ancho?: keyof typeof ANCHOS;
  enlace?: ComponenteDeEnlace;
  /** White logo, for the navy sidebar. */
  logo?: string;
  /** Red logo, for the white header below lg. */
  logoEnCabecera?: string;
}) {
  const [compacta, setCompacta] = useBarraCompacta();
  const marca = <Marca logo={logo} nombreDeApp={nombreDeApp} />;

  return (
    <div className="flex min-h-screen">
      <aside
        className={unir(
          'sticky top-0 hidden h-screen shrink-0 flex-col overflow-y-auto border-r border-[var(--navy-line)] bg-[var(--navy)] transition-[width] lg:flex',
          compacta ? 'w-[4.25rem]' : 'w-72',
        )}
      >
        <div
          className={unir(
            'flex items-center border-b border-[var(--navy-line)] py-7',
            compacta ? 'justify-center px-2' : 'justify-between gap-3 px-6',
          )}
        >
          {!compacta && marca}
          <button
            type="button"
            onClick={() => setCompacta(!compacta)}
            aria-label={compacta ? 'Mostrar navegación' : 'Compactar navegación'}
            title={compacta ? 'Mostrar navegación' : 'Compactar navegación'}
            className={BOTON_SOBRE_NAVY}
          >
            <Icono nombre={compacta ? 'expandir' : 'compactar'} className="size-4" />
          </button>
        </div>
        <div className={unir('flex flex-1 flex-col justify-between gap-6 py-6', compacta ? 'px-2' : 'px-5')}>
          <NavegacionLateral secciones={secciones} enlace={enlace} compacta={compacta} />
          {lanzadorUrl && <EnlaceAlLanzador href={lanzadorUrl} compacta={compacta} />}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[rgba(255,255,255,0.88)] backdrop-blur-md">
          <div className="flex h-[68px] items-center gap-4 px-4 sm:h-20 sm:px-6 lg:px-8">
            {lanzadorUrl && (
              <a
                href={lanzadorUrl}
                aria-label={TEXTO_VOLVER}
                title={TEXTO_VOLVER}
                className="inline-flex items-center justify-center rounded-[var(--panel-radius)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-[var(--foreground)] transition hover:bg-[var(--background-soft)]"
              >
                <Icono nombre="volver" className="size-5" />
              </a>
            )}
            <div className="flex items-center gap-3 lg:hidden">
              {secciones.length > 0 && (
                <MenuMovil marca={marca} secciones={secciones} lanzadorUrl={lanzadorUrl} enlace={enlace} />
              )}
              <img src={logoEnCabecera} alt="Basket.tv" className="h-7 w-auto" />
            </div>
            <div className="ml-auto flex items-center gap-4 sm:gap-5">{cabecera}</div>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className={unir('mx-auto flex w-full flex-col gap-6', ANCHOS[ancho])}>{children}</div>
        </main>
      </div>
    </div>
  );
}

/**
 * Portal's ghost logout button, as a link. `href` is always `${portalUrl}/logout`:
 * a full navigation to the Portal's route handler, which ends the shared session
 * and clears the cookies of every subdomain. Always a plain `<a>`: a client
 * link could prefetch it and sign the person out by itself.
 */
export function BotonDeSalir({ href }: { href: string }) {
  return (
    <a
      href={href}
      aria-label="Cerrar sesión"
      title="Cerrar sesión"
      className="inline-flex size-11 items-center justify-center rounded-2xl text-[var(--muted)] transition hover:bg-[var(--background-soft)] hover:text-[var(--foreground)]"
    >
      <Icono nombre="salir" className="size-4" />
    </a>
  );
}

function EnlaceNativo(props: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return <a {...props} />;
}

// Starts expanded on the server and on the first paint, then reads the choice:
// reading localStorage in the initializer would not match the server HTML.
function useBarraCompacta(): [boolean, (valor: boolean) => void] {
  const [compacta, setCompacta] = useState(false);

  useEffect(() => {
    setCompacta(leerCompacta());
  }, []);

  return [
    compacta,
    (valor) => {
      setCompacta(valor);
      try {
        window.localStorage.setItem(CLAVE_DE_COMPACTA, String(valor));
      } catch {
        // Sin storage (modo privado): la elección dura lo que la página.
      }
    },
  ];
}

function leerCompacta(): boolean {
  try {
    return window.localStorage.getItem(CLAVE_DE_COMPACTA) === 'true';
  } catch {
    return false;
  }
}

function Marca({ logo, nombreDeApp }: { logo: string; nombreDeApp: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <img src={logo} alt="Basket.tv" className="h-9 w-auto self-start" />
      <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[var(--navy-text)]">{nombreDeApp}</p>
    </div>
  );
}

/** The Portal's sidebar nav (dashboard-nav): the active section in red, the rest on navy. */
function NavegacionLateral({
  secciones,
  enlace: Enlace,
  compacta = false,
}: {
  secciones: readonly EnlaceDeNavegacion[];
  enlace: ComponenteDeEnlace;
  compacta?: boolean;
}) {
  return (
    <nav aria-label="Secciones" className="space-y-2">
      {secciones.map((item) => (
        <Enlace
          key={item.clave}
          href={item.href}
          aria-current={item.activa ? 'page' : undefined}
          aria-label={compacta ? item.titulo : undefined}
          title={compacta ? item.titulo : undefined}
          onClick={(evento: MouseEvent<HTMLAnchorElement>) => {
            if (!item.onElegir || evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.button !== 0) return;
            evento.preventDefault();
            item.onElegir();
          }}
          className={unir(
            'flex items-center gap-3 rounded-[var(--panel-radius)] py-3.5 text-[15px] font-semibold text-white transition [&_svg]:size-5 [&_svg]:shrink-0',
            compacta ? 'justify-center px-0' : 'px-4',
            item.activa
              ? 'bg-[var(--accent)] shadow-[0_14px_32px_rgba(227,27,35,0.24)]'
              : 'bg-[var(--navy-item)] hover:bg-[var(--navy-hover)]',
          )}
        >
          {item.icono}
          {!compacta && item.titulo}
        </Enlace>
      ))}
    </nav>
  );
}

/** The way out to the Portal's app launcher, at the foot of the sidebar. */
function EnlaceAlLanzador({ href, compacta = false }: { href: string; compacta?: boolean }) {
  return (
    <a
      href={href}
      aria-label={compacta ? TEXTO_DEL_LANZADOR : undefined}
      title={compacta ? TEXTO_DEL_LANZADOR : undefined}
      className={unir(
        'flex items-center gap-3 rounded-[var(--panel-radius)] py-3.5 text-sm font-semibold text-[var(--navy-text)] transition hover:bg-[var(--navy-hover)] hover:text-white',
        compacta ? 'justify-center px-0' : 'px-4',
      )}
    >
      <Icono nombre="aplicaciones" />
      {!compacta && TEXTO_DEL_LANZADOR}
    </a>
  );
}

/**
 * Below lg the sidebar opens as a drawer from the header's menu button, like
 * the Portal's dashboard-mobile-nav. It goes to <body>: the header's
 * backdrop-blur would otherwise trap the fixed overlay inside it.
 */
function MenuMovil({
  marca,
  secciones,
  lanzadorUrl,
  enlace,
}: {
  marca: ReactNode;
  secciones: readonly EnlaceDeNavegacion[];
  lanzadorUrl: string | null;
  enlace: ComponenteDeEnlace;
}) {
  const [abierto, setAbierto] = useState(false);
  const cajon = useRef<HTMLElement>(null);
  const idDelCajon = useId();

  // El foco entra al cajón, no se escapa con Tab y vuelve al botón al cerrar.
  useEffect(() => {
    if (!abierto) return;
    const antes = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    cajon.current?.querySelector<HTMLElement>('a, button')?.focus();
    const desborde = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const alTeclear = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') setAbierto(false);
      if (evento.key === 'Tab' && cajon.current) retenerFoco(evento, cajon.current);
    };
    document.addEventListener('keydown', alTeclear);
    return () => {
      document.body.style.overflow = desborde;
      document.removeEventListener('keydown', alTeclear);
      antes?.focus();
    };
  }, [abierto]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setAbierto(true)}
        aria-label="Abrir navegación"
        aria-expanded={abierto}
        aria-controls={idDelCajon}
        className="inline-flex size-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] transition hover:bg-[var(--background-soft)]"
      >
        <Icono nombre="menu" className="size-5" />
      </button>
      {abierto &&
        createPortal(
          <div className="fixed inset-0 z-[100] lg:hidden">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[rgba(7,18,43,0.55)] backdrop-blur-sm"
              onClick={() => setAbierto(false)}
            />
            <aside
              ref={cajon}
              id={idDelCajon}
              role="dialog"
              aria-modal="true"
              aria-label="Navegación"
              className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col overflow-y-auto border-r border-[var(--navy-line)] bg-[var(--navy)]"
              onClickCapture={(evento) => {
                if ((evento.target as HTMLElement).closest('a')) setAbierto(false);
              }}
            >
              <div className="flex items-start justify-between gap-3 border-b border-[var(--navy-line)] px-6 py-7">
                {marca}
                <button type="button" onClick={() => setAbierto(false)} aria-label="Cerrar navegación" className={BOTON_SOBRE_NAVY}>
                  <Icono nombre="cerrar" className="size-4" />
                </button>
              </div>
              <div className="flex flex-1 flex-col justify-between gap-6 px-5 py-6">
                <NavegacionLateral secciones={secciones} enlace={enlace} />
                {lanzadorUrl && <EnlaceAlLanzador href={lanzadorUrl} />}
              </div>
            </aside>
          </div>,
          document.body,
        )}
    </div>
  );
}
