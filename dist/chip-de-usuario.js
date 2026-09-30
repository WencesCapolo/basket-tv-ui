import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Portal UserProfileChip without the photo upload: name, role and initials. */
export function ChipDeUsuario({ nombre, rol }) {
    const [primero = '', segundo = ''] = nombre.trim().split(/\s+/);
    return (_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "hidden text-right sm:block", children: [_jsx("p", { className: "text-[15px] font-extrabold leading-none", children: nombre }), _jsx("p", { className: "mt-1 text-xs font-black uppercase tracking-[0.08em] text-[var(--accent)]", children: rol })] }), _jsx("span", { className: "flex size-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--n-200)] text-sm font-extrabold text-[var(--n-700)] shadow-sm ring-2 ring-white sm:size-14", children: `${primero.charAt(0)}${segundo.charAt(0)}`.toUpperCase() || '·' })] }));
}
