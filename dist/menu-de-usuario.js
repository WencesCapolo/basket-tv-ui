'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useId, useRef, useState } from 'react';
import { ChipDeUsuario, inicialesDe } from './chip-de-usuario.js';
import { Icono } from './iconos.js';
import { BotonDeSalir } from './marco.js';
const OPCION = 'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--background-soft)] [&_svg]:size-[18px] [&_svg]:text-[var(--muted)]';
/**
 * The user in the header. From sm up it is `ChipDeUsuario` plus
 * `BotonDeSalir`; below sm only the initials fit, and they open a menu with
 * the name, the role, "Elegir aplicación" and "Cerrar sesión".
 */
export function MenuDeUsuario({ nombre, rol, salirUrl, lanzadorUrl = null, }) {
    const [abierto, setAbierto] = useState(false);
    const contenedor = useRef(null);
    const boton = useRef(null);
    const idDelMenu = useId();
    useEffect(() => {
        if (!abierto)
            return;
        const alTocarAfuera = (evento) => {
            if (!contenedor.current?.contains(evento.target))
                setAbierto(false);
        };
        const alTeclear = (evento) => {
            if (evento.key !== 'Escape')
                return;
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
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "hidden items-center gap-5 sm:flex", children: [_jsx(ChipDeUsuario, { nombre: nombre, rol: rol }), _jsx(BotonDeSalir, { href: salirUrl })] }), _jsxs("div", { ref: contenedor, className: "relative sm:hidden", children: [_jsx("button", { ref: boton, type: "button", onClick: () => setAbierto(!abierto), "aria-label": `Menú de ${nombre}`, "aria-expanded": abierto, "aria-controls": idDelMenu, className: "flex size-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--n-200)] text-sm font-extrabold text-[var(--n-700)] shadow-sm ring-2 ring-white", children: inicialesDe(nombre) }), abierto && (_jsxs("div", { id: idDelMenu, className: "absolute top-[calc(100%+0.75rem)] right-0 z-50 w-64 rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-2 shadow-[var(--shadow-lift)]", children: [_jsxs("div", { className: "mb-1.5 border-b border-[var(--border)] px-3 pt-2 pb-3", children: [_jsx("p", { className: "truncate text-[15px] font-extrabold", children: nombre }), _jsx("p", { className: "mt-0.5 text-xs font-black uppercase tracking-[0.08em] text-[var(--accent)]", children: rol })] }), lanzadorUrl && (_jsxs("a", { href: lanzadorUrl, className: OPCION, children: [_jsx(Icono, { nombre: "aplicaciones" }), "Elegir aplicaci\u00F3n"] })), _jsxs("a", { href: salirUrl, className: OPCION, children: [_jsx(Icono, { nombre: "salir" }), "Cerrar sesi\u00F3n"] })] }))] })] }));
}
