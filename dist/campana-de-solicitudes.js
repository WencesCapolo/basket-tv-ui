'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal, useFormStatus } from 'react-dom';
import { retenerFoco } from './foco.js';
import { Icono } from './iconos.js';
import { unir } from './unir.js';
// Se abre sola una vez por conjunto de pendientes y por pestaña. Cerrarla es
// local: no toca ninguna Solicitud, así que nadie más deja de verla.
const PREFIJO_DE_ABIERTAS = 'basket-tv-ui.solicitudes.abiertas:';
/**
 * The bell with the pending count and its modal. UI only: each app loads the
 * Solicitudes it may decide and passes its own `aprobar` / `rechazar`. Both
 * forms post `solicitudId` and `app`; `aprobar` also posts `rol`. Hidden
 * fields in `camposOcultos` (a return path, say) go with both.
 */
export function CampanaDeSolicitudes({ solicitudes, aprobar, rechazar, camposOcultos = {}, }) {
    const [abierta, setAbierta] = useState(false);
    const cerrar = useCallback(() => setAbierta(false), []);
    const cantidad = solicitudes.length;
    const version = useMemo(() => solicitudes.map((s) => s.id).join('|'), [solicitudes]);
    useEffect(() => {
        if (!version)
            return;
        const clave = `${PREFIJO_DE_ABIERTAS}${version}`;
        try {
            if (window.sessionStorage.getItem(clave))
                return;
            window.sessionStorage.setItem(clave, '1');
        }
        catch {
            // Sin storage se vuelve a abrir en la próxima navegación.
        }
        setAbierta(true);
    }, [version]);
    return (_jsxs(_Fragment, { children: [_jsxs("button", { type: "button", onClick: () => setAbierta(true), "aria-label": cantidad ? `Solicitudes de acceso pendientes: ${cantidad}` : 'Solicitudes de acceso', "aria-haspopup": "dialog", className: unir('relative inline-flex size-11 items-center justify-center rounded-2xl bg-[var(--surface)] text-[var(--n-700)] transition hover:bg-[var(--background-soft)] hover:text-[var(--foreground)]', !cantidad && 'opacity-70'), children: [_jsx(Icono, { nombre: "solicitudes", className: "size-5" }), cantidad > 0 && (_jsx("span", { className: "absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-[var(--accent)] px-1.5 text-[11px] font-black text-white", children: cantidad }))] }), abierta && (_jsx(ModalDeSolicitudes, { solicitudes: solicitudes, aprobar: aprobar, rechazar: rechazar, camposOcultos: camposOcultos, alCerrar: cerrar }))] }));
}
// Va a <body>: el backdrop-blur del encabezado atraparía el overlay fijo.
function ModalDeSolicitudes({ solicitudes, aprobar, rechazar, camposOcultos, alCerrar, }) {
    const panel = useRef(null);
    const idDelTitulo = useId();
    // null es "todas cerradas"; un id que ya no está (se resolvió) vuelve a la primera.
    const [elegida, setElegida] = useState(solicitudes[0]?.id ?? null);
    const expandida = elegida === null || solicitudes.some((s) => s.id === elegida) ? elegida : (solicitudes[0]?.id ?? null);
    const cantidad = solicitudes.length;
    useEffect(() => {
        const antes = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        panel.current?.querySelector('button')?.focus();
        const desborde = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const alTeclear = (evento) => {
            if (evento.key === 'Escape')
                alCerrar();
            if (evento.key === 'Tab' && panel.current)
                retenerFoco(evento, panel.current);
        };
        document.addEventListener('keydown', alTeclear);
        return () => {
            document.body.style.overflow = desborde;
            document.removeEventListener('keydown', alTeclear);
            antes?.focus();
        };
    }, [alCerrar]);
    return createPortal(_jsx("div", { className: "fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-[rgba(28,13,16,0.6)] p-4 backdrop-blur-sm", onClick: alCerrar, children: _jsxs("div", { ref: panel, role: "dialog", "aria-modal": "true", "aria-labelledby": idDelTitulo, className: "relative my-8 w-full max-w-2xl rounded-[var(--panel-radius)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lift)]", onClick: (evento) => evento.stopPropagation(), children: [_jsxs("div", { className: "flex items-start justify-between gap-4 border-b border-[var(--border)] px-6 py-5", children: [_jsxs("div", { children: [_jsx("p", { className: "text-[11px] font-black uppercase tracking-[0.24em] text-[var(--accent)]", children: "Solicitudes" }), _jsx("h3", { id: idDelTitulo, className: "mt-1 text-2xl font-extrabold tracking-[-0.03em] text-[var(--foreground)]", children: cantidad
                                        ? `${cantidad} solicitud${cantidad === 1 ? '' : 'es'} pendiente${cantidad === 1 ? '' : 's'}`
                                        : 'No hay solicitudes pendientes' })] }), _jsx("button", { type: "button", onClick: alCerrar, "aria-label": "Cerrar solicitudes", className: "inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--background-soft)] text-[var(--n-400)] transition hover:bg-[var(--n-100)] hover:text-[var(--n-700)]", children: _jsx(Icono, { nombre: "cerrar", className: "size-4" }) })] }), _jsx("ul", { className: "divide-y divide-[var(--border)]", children: solicitudes.map((solicitud) => {
                        const abierta = expandida === solicitud.id;
                        return (_jsxs("li", { className: "px-6 py-4", children: [_jsxs("button", { type: "button", onClick: () => setElegida(abierta ? null : solicitud.id), "aria-expanded": abierta, className: "flex w-full items-center justify-between gap-4 text-left", children: [_jsxs("span", { className: "min-w-0", children: [_jsxs("span", { className: "flex items-center gap-2", children: [_jsx("span", { className: "truncate text-base font-extrabold text-[var(--foreground)]", children: solicitud.nombre }), _jsx(InsigniaDeApp, { nombre: solicitud.nombreDeApp })] }), _jsx("span", { className: "block truncate text-sm text-[var(--n-500)]", children: [solicitud.funcion, solicitud.email].filter(Boolean).join(' · ') })] }), _jsx("span", { className: "shrink-0 text-xs font-black uppercase tracking-[0.16em] text-[var(--accent)]", children: abierta ? 'Cerrar' : 'Revisar' })] }), abierta && (_jsx("div", { className: "mt-4", children: solicitud.decision ?? (_jsx(DecisionPorRol, { solicitud: solicitud, aprobar: aprobar, rechazar: rechazar, camposOcultos: camposOcultos })) }))] }, solicitud.id));
                    }) }), !cantidad && (_jsx("p", { className: "px-6 py-6 text-sm text-[var(--n-500)]", children: "Cuando alguien se registre, su solicitud aparece ac\u00E1." }))] }) }), document.body);
}
function InsigniaDeApp({ nombre }) {
    return (_jsx("span", { className: "shrink-0 rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--accent-strong)]", children: nombre }));
}
function DecisionPorRol({ solicitud, aprobar, rechazar, camposOcultos, }) {
    const idDelRol = useId();
    const ocultos = (_jsxs(_Fragment, { children: [_jsx("input", { type: "hidden", name: "solicitudId", value: solicitud.id }), _jsx("input", { type: "hidden", name: "app", value: solicitud.app }), Object.entries(camposOcultos).map(([nombre, valor]) => (_jsx("input", { type: "hidden", name: nombre, value: valor }, nombre)))] }));
    // Con un solo rol posible no hay nada que elegir; con varios, se elige a propósito.
    const unico = solicitud.roles.length === 1 ? solicitud.roles[0]?.valor : undefined;
    return (_jsxs("div", { className: "space-y-4 rounded-[var(--panel-radius)] border border-[var(--border)] bg-[var(--background-soft)] p-4", children: [_jsxs("dl", { className: "space-y-1 text-sm", children: [_jsx(Fila, { etiqueta: "App", valor: solicitud.nombreDeApp }), _jsx(Fila, { etiqueta: "Email", valor: solicitud.email }), solicitud.telefono && _jsx(Fila, { etiqueta: "Tel\u00E9fono", valor: solicitud.telefono }), solicitud.funcion && _jsx(Fila, { etiqueta: "Funci\u00F3n", valor: solicitud.funcion }), solicitud.ciudad && _jsx(Fila, { etiqueta: "Ciudad", valor: solicitud.ciudad }), solicitud.mensaje && _jsx(Fila, { etiqueta: "Mensaje", valor: solicitud.mensaje })] }), solicitud.roles.length > 0 ? (_jsxs("form", { action: aprobar, className: "flex flex-wrap items-end gap-3", children: [ocultos, _jsxs("label", { htmlFor: idDelRol, className: "flex min-w-48 flex-1 flex-col gap-1.5", children: [_jsx("span", { className: "text-xs font-black uppercase tracking-[0.16em] text-[var(--n-500)]", children: "Rol" }), _jsxs("select", { id: idDelRol, name: "rol", required: true, defaultValue: unico ?? '', className: "h-11 rounded-[var(--panel-radius)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--foreground)]", children: [!unico && (_jsx("option", { value: "", disabled: true, children: "Eleg\u00ED un rol" })), solicitud.roles.map((rol) => (_jsx("option", { value: rol.valor, children: rol.etiqueta }, rol.valor)))] })] }), _jsx(BotonDeEnvio, { pendiente: "Aprobando...", children: "Aprobar" })] })) : (_jsxs("p", { className: "text-sm text-[var(--n-500)]", children: ["No pod\u00E9s otorgar ning\u00FAn rol de ", solicitud.nombreDeApp, "."] })), _jsxs("form", { action: rechazar, children: [ocultos, _jsx(BotonDeEnvio, { pendiente: "Rechazando...", fantasma: true, children: "Rechazar" })] })] }));
}
function BotonDeEnvio({ children, pendiente, fantasma = false }) {
    const { pending: enviando } = useFormStatus();
    return (_jsx("button", { type: "submit", disabled: enviando, className: unir('inline-flex h-11 items-center justify-center rounded-[var(--panel-radius)] px-5 text-sm font-bold transition disabled:opacity-60', fantasma
            ? 'text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]'
            : 'bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)]'), children: enviando ? pendiente : children }));
}
function Fila({ etiqueta, valor }) {
    return (_jsxs("div", { className: "flex gap-3", children: [_jsx("dt", { className: "w-20 shrink-0 text-xs font-black uppercase tracking-[0.14em] text-[var(--n-500)]", children: etiqueta }), _jsx("dd", { className: "min-w-0 flex-1 text-[var(--foreground)]", children: valor })] }));
}
