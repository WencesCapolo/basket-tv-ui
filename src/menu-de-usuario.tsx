'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ChipDeUsuario, inicialesDe } from './chip-de-usuario.js';
import { Icono } from './iconos.js';
import { BotonDeSalir } from './marco.js';

const OPCION =
  'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--background-soft)] [&_svg]:size-[18px] [&_svg]:text-[var(--muted)]';

/**
 * The user in the header. From sm up it is `ChipDeUsuario` plus
 * `BotonDeSalir`; below sm only the initials fit, and they open a menu with
 * the name, the role, "Elegir aplicación" and "Cerrar sesión".
 */
export function MenuDeUsuario({
  nombre,
  rol,
  salirUrl,
  lanzadorUrl = null,
}: {
  nombre: string;
  rol: string;
  /** `${portalUrl}/logout`, as in `BotonDeSalir`. */
  salirUrl: string;
  /** The Portal's app launcher; without it the menu has no "Elegir aplicación". */
  lanzadorUrl?: string | null;
}) {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);
  const idDelMenu = useId();

  useEffect(() => {
    if (!abierto) return;
    const alTocarAfuera = (evento: PointerEvent) => {
      if (!contenedor.current?.contains(evento.target as Node)) setAbierto(false);
    };
    const alTeclear = (evento: KeyboardEvent) => {
      if (evento.key !== 'Escape') return;
      setAbierto(false);
      boton.current?.focus();
    };
    document.addEventListener('pointerdown', alTocarAfuera);
    document.addEventListener('keydown', alTeclear);
    return () => {
      document.removeEventListener('pointerdown', alTocarAfuera);
      document.removeEventListener('keydown', alTeclear);
    };
  }, [abierto]);

  return (
    <>
      <div className="hidden items-center gap-5 sm:flex">
        <ChipDeUsuario nombre={nombre} rol={rol} />
        <BotonDeSalir href={salirUrl} />
      </div>

      <div ref={contenedor} className="relative sm:hidden">
        <button
          ref={boton}
          type="button"
          onClick={() => setAbierto(!abierto)}
          aria-label={`Menú de ${nombre}`}
          aria-expanded={abierto}
          aria-controls={idDelMenu}
          className="flex size-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--n-200)] text-sm font-extrabold text-[var(--n-700)] shadow-sm ring-2 ring-white"
        >
          {inicialesDe(nombre)}
        </button>
        {abierto && (
          <div
            id={idDelMenu}
            className="absolute top-[calc(100%+0.75rem)] right-0 z-50 w-64 rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-2 shadow-[var(--shadow-lift)]"
          >
            <div className="mb-1.5 border-b border-[var(--border)] px-3 pt-2 pb-3">
              <p className="truncate text-[15px] font-extrabold">{nombre}</p>
              <p className="mt-0.5 text-xs font-black uppercase tracking-[0.08em] text-[var(--accent)]">{rol}</p>
            </div>
            {lanzadorUrl && (
              <a href={lanzadorUrl} className={OPCION}>
                <Icono nombre="aplicaciones" />
                Elegir aplicación
              </a>
            )}
            {/* Un `<a>` común, como BotonDeSalir: un link del cliente podría precargarlo. */}
            <a href={salirUrl} className={OPCION}>
              <Icono nombre="salir" />
              Cerrar sesión
            </a>
          </div>
        )}
      </div>
    </>
  );
}
