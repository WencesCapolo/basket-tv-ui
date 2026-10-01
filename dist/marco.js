'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useId, useRef, useState, } from 'react';
import { createPortal } from 'react-dom';
import { retenerFoco } from './foco.js';
import { Icono } from './iconos.js';
import { unir } from './unir.js';
const TEXTO_VOLVER = 'Volver';
const TEXTO_DEL_LANZADOR = 'Elegir aplicación';
const CLAVE_DE_COMPACTA = 'basket-tv-ui.barra-lateral.compacta';
const ANCHOS = { normal: 'max-w-6xl', amplio: 'max-w-none' };
const BOTON_SOBRE_NAVY = 'inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-[var(--navy-control-line)] bg-[var(--navy-control)] text-[var(--navy-text)] transition hover:border-[var(--navy-control-hover)] hover:text-white';
/**
 * The shell every basket-app.com app shares: the navy sidebar with the brand,
 * the sections and "Elegir aplicación" (collapsible, a drawer below lg); the
 * sticky header with "Volver" to the launcher and the user; and the page.
 */
export function Marco({ children, nombreDeApp, secciones = [], lanzadorUrl = null, cabecera, ancho = 'normal', enlace = EnlaceNativo, logo = '/basket-tv-horizontal-blanco.png', logoEnCabecera = '/basket-tv-horizontal-rojo.png', }) {
    const [compacta, setCompacta] = useBarraCompacta();
    const marca = _jsx(Marca, { logo: logo, nombreDeApp: nombreDeApp });
    return (_jsxs("div", { className: "flex min-h-screen", children: [_jsxs("aside", { className: unir('sticky top-0 hidden h-screen shrink-0 flex-col overflow-y-auto border-r border-[var(--navy-line)] bg-[var(--navy)] transition-[width] lg:flex', compacta ? 'w-[4.25rem]' : 'w-72'), children: [_jsxs("div", { className: unir('flex items-center border-b border-[var(--navy-line)] py-7', compacta ? 'justify-center px-2' : 'justify-between gap-3 px-6'), children: [!compacta && marca, _jsx("button", { type: "button", onClick: () => setCompacta(!compacta), "aria-label": compacta ? 'Mostrar navegación' : 'Compactar navegación', title: compacta ? 'Mostrar navegación' : 'Compactar navegación', className: BOTON_SOBRE_NAVY, children: _jsx(Icono, { nombre: compacta ? 'expandir' : 'compactar', className: "size-4" }) })] }), _jsxs("div", { className: unir('flex flex-1 flex-col justify-between gap-6 py-6', compacta ? 'px-2' : 'px-5'), children: [_jsx(NavegacionLateral, { secciones: secciones, enlace: enlace, compacta: compacta }), lanzadorUrl && _jsx(EnlaceAlLanzador, { href: lanzadorUrl, compacta: compacta })] })] }), _jsxs("div", { className: "flex min-w-0 flex-1 flex-col", children: [_jsx("header", { className: "sticky top-0 z-40 border-b border-[var(--border)] bg-[rgba(255,255,255,0.88)] backdrop-blur-md", children: _jsxs("div", { className: "flex h-[68px] items-center gap-4 px-4 sm:h-20 sm:px-6 lg:px-8", children: [lanzadorUrl && (_jsx("a", { href: lanzadorUrl, "aria-label": TEXTO_VOLVER, title: TEXTO_VOLVER, className: "inline-flex items-center justify-center rounded-[var(--panel-radius)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-[var(--foreground)] transition hover:bg-[var(--background-soft)]", children: _jsx(Icono, { nombre: "volver", className: "size-5" }) })), _jsxs("div", { className: "flex items-center gap-3 lg:hidden", children: [secciones.length > 0 && (_jsx(MenuMovil, { marca: marca, secciones: secciones, lanzadorUrl: lanzadorUrl, enlace: enlace })), _jsx("img", { src: logoEnCabecera, alt: "Basket.tv", className: "h-7 w-auto" })] }), _jsx("div", { className: "ml-auto flex items-center gap-4 sm:gap-5", children: cabecera })] }) }), _jsx("main", { className: "flex-1 px-4 py-6 sm:px-6 lg:px-8", children: _jsx("div", { className: unir('mx-auto flex w-full flex-col gap-6', ANCHOS[ancho]), children: children }) })] })] }));
}
/**
 * Portal's ghost logout button, as a link. `href` is always `${portalUrl}/logout`:
 * a full navigation to the Portal's route handler, which ends the shared session
 * and clears the cookies of every subdomain. Always a plain `<a>`: a client
 * link could prefetch it and sign the person out by itself.
 */
export function BotonDeSalir({ href }) {
    return (_jsx("a", { href: href, "aria-label": "Cerrar sesi\u00F3n", title: "Cerrar sesi\u00F3n", className: "inline-flex size-11 items-center justify-center rounded-2xl text-[var(--muted)] transition hover:bg-[var(--background-soft)] hover:text-[var(--foreground)]", children: _jsx(Icono, { nombre: "salir", className: "size-4" }) }));
}
function EnlaceNativo(props) {
    return _jsx("a", { ...props });
}
// Starts expanded on the server and on the first paint, then reads the choice:
// reading localStorage in the initializer would not match the server HTML.
function useBarraCompacta() {
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
            }
            catch {
                // Sin storage (modo privado): la elección dura lo que la página.
            }
        },
    ];
}
function leerCompacta() {
    try {
        return window.localStorage.getItem(CLAVE_DE_COMPACTA) === 'true';
    }
    catch {
        return false;
    }
}
function Marca({ logo, nombreDeApp }) {
    return (_jsxs("div", { className: "flex min-w-0 flex-col gap-2", children: [_jsx("img", { src: logo, alt: "Basket.tv", className: "h-9 w-auto self-start" }), _jsx("p", { className: "text-[11px] font-black uppercase tracking-[0.28em] text-[var(--navy-text)]", children: nombreDeApp })] }));
}
/** The Portal's sidebar nav (dashboard-nav): the active section in red, the rest on navy. */
function NavegacionLateral({ secciones, enlace: Enlace, compacta = false, }) {
    return (_jsx("nav", { "aria-label": "Secciones", className: "space-y-2", children: secciones.map((item) => (_jsxs(Enlace, { href: item.href, "aria-current": item.activa ? 'page' : undefined, "aria-label": compacta ? item.titulo : undefined, title: compacta ? item.titulo : undefined, onClick: (evento) => {
                if (!item.onElegir || evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.button !== 0)
                    return;
                evento.preventDefault();
                item.onElegir();
            }, className: unir('flex items-center gap-3 rounded-[var(--panel-radius)] py-3.5 text-[15px] font-semibold text-white transition [&_svg]:size-5 [&_svg]:shrink-0', compacta ? 'justify-center px-0' : 'px-4', item.activa
                ? 'bg-[var(--accent)] shadow-[0_14px_32px_rgba(227,27,35,0.24)]'
                : 'bg-[var(--navy-item)] hover:bg-[var(--navy-hover)]'), children: [item.icono, !compacta && item.titulo] }, item.clave))) }));
}
/** The way out to the Portal's app launcher, at the foot of the sidebar. */
function EnlaceAlLanzador({ href, compacta = false }) {
    return (_jsxs("a", { href: href, "aria-label": compacta ? TEXTO_DEL_LANZADOR : undefined, title: compacta ? TEXTO_DEL_LANZADOR : undefined, className: unir('flex items-center gap-3 rounded-[var(--panel-radius)] py-3.5 text-sm font-semibold text-[var(--navy-text)] transition hover:bg-[var(--navy-hover)] hover:text-white', compacta ? 'justify-center px-0' : 'px-4'), children: [_jsx(Icono, { nombre: "aplicaciones" }), !compacta && TEXTO_DEL_LANZADOR] }));
}
/**
 * Below lg the sidebar opens as a drawer from the header's menu button, like
 * the Portal's dashboard-mobile-nav. It goes to <body>: the header's
 * backdrop-blur would otherwise trap the fixed overlay inside it.
 */
function MenuMovil({ marca, secciones, lanzadorUrl, enlace, }) {
    const [abierto, setAbierto] = useState(false);
    const cajon = useRef(null);
    const idDelCajon = useId();
    // El foco entra al cajón, no se escapa con Tab y vuelve al botón al cerrar.
    useEffect(() => {
        if (!abierto)
            return;
        const antes = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        cajon.current?.querySelector('a, button')?.focus();
        const desborde = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const alTeclear = (evento) => {
            if (evento.key === 'Escape')
                setAbierto(false);
            if (evento.key === 'Tab' && cajon.current)
                retenerFoco(evento, cajon.current);
        };
        document.addEventListener('keydown', alTeclear);
        return () => {
            document.body.style.overflow = desborde;
            document.removeEventListener('keydown', alTeclear);
            antes?.focus();
        };
    }, [abierto]);
    return (_jsxs("div", { className: "lg:hidden", children: [_jsx("button", { type: "button", onClick: () => setAbierto(true), "aria-label": "Abrir navegaci\u00F3n", "aria-expanded": abierto, "aria-controls": idDelCajon, className: "inline-flex size-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] transition hover:bg-[var(--background-soft)]", children: _jsx(Icono, { nombre: "menu", className: "size-5" }) }), abierto &&
                createPortal(_jsxs("div", { className: "fixed inset-0 z-[100] lg:hidden", children: [_jsx("div", { "aria-hidden": "true", className: "absolute inset-0 bg-[rgba(7,18,43,0.55)] backdrop-blur-sm", onClick: () => setAbierto(false) }), _jsxs("aside", { ref: cajon, id: idDelCajon, role: "dialog", "aria-modal": "true", "aria-label": "Navegaci\u00F3n", className: "absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col overflow-y-auto border-r border-[var(--navy-line)] bg-[var(--navy)]", onClickCapture: (evento) => {
                                if (evento.target.closest('a'))
                                    setAbierto(false);
                            }, children: [_jsxs("div", { className: "flex items-start justify-between gap-3 border-b border-[var(--navy-line)] px-6 py-7", children: [marca, _jsx("button", { type: "button", onClick: () => setAbierto(false), "aria-label": "Cerrar navegaci\u00F3n", className: BOTON_SOBRE_NAVY, children: _jsx(Icono, { nombre: "cerrar", className: "size-4" }) })] }), _jsxs("div", { className: "flex flex-1 flex-col justify-between gap-6 px-5 py-6", children: [_jsx(NavegacionLateral, { secciones: secciones, enlace: enlace }), lanzadorUrl && _jsx(EnlaceAlLanzador, { href: lanzadorUrl })] })] })] }), document.body)] }));
}
