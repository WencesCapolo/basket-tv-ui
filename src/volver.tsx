'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Icono } from './iconos.js';
import type { ComponenteDeEnlace, EnlaceDeNavegacion } from './marco.js';
import { unir } from './unir.js';

const TEXTO_VOLVER = 'Volver';

export type SeccionParaVolver = Pick<EnlaceDeNavegacion, 'href' | 'activa' | 'onElegir'>;

export type DestinoDeVolver =
  | { readonly tipo: 'lanzador'; readonly href: string }
  /** `href` is where to land when there is no page of the app to go back to. */
  | { readonly tipo: 'atras'; readonly href: string; readonly seccion: SeccionParaVolver | null };

/**
 * Volver is the browser's back inside an app, and the launcher at its top.
 * The top is "/" and every section's own page, whatever its query: `/int?dia=…`
 * leads to the launcher, `/int/123` back to the list it came from.
 */
export function destinoDeVolver(
  url: string,
  secciones: readonly SeccionParaVolver[],
  lanzadorUrl: string,
): DestinoDeVolver {
  const actual = new URL(url);
  const ruta = normalizar(actual.pathname);
  const propias = secciones
    .map((seccion) => ({ seccion, url: new URL(seccion.href, actual) }))
    .filter((s) => s.url.origin === actual.origin);

  if (ruta === '/' || propias.some((s) => normalizar(s.url.pathname) === ruta)) {
    return { tipo: 'lanzador', href: lanzadorUrl };
  }
  const activa = propias.find((s) => s.seccion.activa);
  return activa
    ? { tipo: 'atras', href: activa.seccion.href, seccion: activa.seccion }
    : { tipo: 'atras', href: lanzadorUrl, seccion: null };
}

/**
 * Whether going back stays in this app. The Navigation API only lists this
 * origin's entries, so arriving from the launcher (another origin) gives false.
 * Without it: a same-origin referrer, or a client navigation since `entrada`.
 */
export function hayAtrasEnLaApp(entrada: string): boolean {
  const navegacion = (window as { navigation?: { canGoBack?: unknown } }).navigation;
  if (typeof navegacion?.canGoBack === 'boolean') return navegacion.canGoBack;
  const origen = window.location.origin;
  return document.referrer.startsWith(`${origen}/`) || window.location.href !== entrada;
}

export function BotonDeVolver({
  lanzadorUrl,
  secciones = [],
  enlace: Enlace,
  className,
}: {
  lanzadorUrl: string;
  secciones?: readonly SeccionParaVolver[];
  enlace: ComponenteDeEnlace;
  className?: string;
}) {
  const entrada = useRef('');
  // The server does not know the URL: until mounted it is the launcher, as before.
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    entrada.current ||= window.location.href;
    setUrl(window.location.href);
  });

  const destino = url ? destinoDeVolver(url, secciones, lanzadorUrl) : null;
  const href = destino?.href ?? lanzadorUrl;
  const clases = unir(
    'shrink-0 items-center justify-center rounded-[var(--panel-radius)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-[var(--foreground)] transition hover:bg-[var(--background-soft)]',
    className,
  );

  const alElegir = (evento: MouseEvent<HTMLAnchorElement>) => {
    if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey || evento.button !== 0) return;
    // The URL may have changed without a render (a filter's replaceState): decide now.
    const ahora = destinoDeVolver(window.location.href, secciones, lanzadorUrl);
    if (ahora.tipo !== 'atras') return;
    if (hayAtrasEnLaApp(entrada.current)) {
      evento.preventDefault();
      window.history.back();
    } else if (ahora.seccion?.onElegir) {
      evento.preventDefault();
      ahora.seccion.onElegir();
    } else if (ahora.href !== href) {
      evento.preventDefault();
      window.location.assign(ahora.href);
    }
    // Otherwise the link itself goes to the section (or the launcher).
  };

  const contenido = <Icono nombre="volver" className="size-5" />;
  // A section's page goes through the app's link; the launcher is another site.
  return destino?.tipo === 'atras' && destino.seccion ? (
    <Enlace href={href} aria-label={TEXTO_VOLVER} title={TEXTO_VOLVER} className={clases} onClick={alElegir}>
      {contenido}
    </Enlace>
  ) : (
    <a href={href} aria-label={TEXTO_VOLVER} title={TEXTO_VOLVER} className={clases} onClick={alElegir}>
      {contenido}
    </a>
  );
}

function normalizar(ruta: string): string {
  return ruta.length > 1 ? ruta.replace(/\/+$/, '') : ruta;
}
