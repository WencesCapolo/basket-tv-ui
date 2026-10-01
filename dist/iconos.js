import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { unir } from './unir.js';
// Los íconos de lucide que usa el marco, copiados como trazos: el paquete no
// arrastra una dependencia de íconos. Los de cada sección los pone cada app.
const TRAZOS = {
    volver: (_jsxs(_Fragment, { children: [_jsx("path", { d: "m12 19-7-7 7-7" }), _jsx("path", { d: "M19 12H5" })] })),
    menu: (_jsxs(_Fragment, { children: [_jsx("path", { d: "M4 12h16" }), _jsx("path", { d: "M4 18h16" }), _jsx("path", { d: "M4 6h16" })] })),
    cerrar: (_jsxs(_Fragment, { children: [_jsx("path", { d: "M18 6 6 18" }), _jsx("path", { d: "m6 6 12 12" })] })),
    aplicaciones: (_jsxs(_Fragment, { children: [_jsx("rect", { width: "7", height: "7", x: "3", y: "3", rx: "1" }), _jsx("rect", { width: "7", height: "7", x: "14", y: "3", rx: "1" }), _jsx("rect", { width: "7", height: "7", x: "14", y: "14", rx: "1" }), _jsx("rect", { width: "7", height: "7", x: "3", y: "14", rx: "1" })] })),
    compactar: (_jsxs(_Fragment, { children: [_jsx("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2" }), _jsx("path", { d: "M9 3v18" }), _jsx("path", { d: "m16 15-3-3 3-3" })] })),
    expandir: (_jsxs(_Fragment, { children: [_jsx("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2" }), _jsx("path", { d: "M9 3v18" }), _jsx("path", { d: "m14 9 3 3-3 3" })] })),
    solicitudes: (_jsxs(_Fragment, { children: [_jsx("path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }), _jsx("circle", { cx: "9", cy: "7", r: "4" }), _jsx("path", { d: "M19 8v6" }), _jsx("path", { d: "M22 11h-6" })] })),
    salir: (_jsxs(_Fragment, { children: [_jsx("path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }), _jsx("path", { d: "m16 17 5-5-5-5" }), _jsx("path", { d: "M21 12H9" })] })),
};
export function Icono({ nombre, className }) {
    return (_jsx("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round", className: unir('size-[18px] shrink-0', className), children: TRAZOS[nombre] }));
}
