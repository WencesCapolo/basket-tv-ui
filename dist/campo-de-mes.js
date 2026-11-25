'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import * as React from 'react';
import { CLASES_DE_CAMPO } from './campo.js';
import { MESES } from './campo-de-fecha.js';
import { escribirValor, Flotante, useFlotante } from './flotante.js';
import { Icono } from './iconos.js';
import { unir } from './unir.js';
const COLUMNAS = 3;
const MES = /^\d{4}-\d{2}$/;
const dosDigitos = (n) => String(n).padStart(2, '0');
function sumarMeses(mes, meses) {
    const total = Number(mes.slice(0, 4)) * 12 + Number(mes.slice(5, 7)) - 1 + meses;
    return `${String(Math.floor(total / 12)).padStart(4, '0')}-${dosDigitos((total % 12) + 1)}`;
}
function esteMes() {
    const d = new Date();
    return `${d.getFullYear()}-${dosDigitos(d.getMonth() + 1)}`;
}
const escrito = (mes) => `${MESES[Number(mes.slice(5, 7)) - 1]} ${mes.slice(0, 4)}`;
/**
 * A month field with our own picker, on every device. Used like
 * `<input type="month">`: `value`/`defaultValue` and `onChange(event)` with
 * `e.target.value` as `AAAA-MM`, `min`, `max`, `name`, `form`, `required`.
 * A hidden native month input keeps the value, posts it and validates it.
 */
export function CampoDeMes({ value, defaultValue, onChange, name, form, required, min, max, placeholder = 'Mes y año', variante = 'campo', className, disabled, onKeyDown, onBlur, ...botonProps }) {
    const controlado = value !== undefined;
    const [propio, setPropio] = React.useState(defaultValue ?? '');
    const actual = controlado ? value : propio;
    const [invalido, setInvalido] = React.useState(false);
    const [activo, setActivo] = React.useState(() => esteMes());
    const boton = React.useRef(null);
    const nativo = React.useRef(null);
    const flotante = useFlotante(boton, { anchoMinimo: 260, alto: 260 });
    const { abierto, abrir, cerrar } = flotante;
    const id = React.useId();
    const elegible = (mes) => (!min || mes >= min) && (!max || mes <= max);
    const acotado = (mes) => (min && mes < min ? min : max && mes > max ? max : mes);
    function abrirSelector() {
        setActivo(acotado(MES.test(actual) ? actual : esteMes()));
        abrir();
    }
    function cerrarSelector(enfocar = true) {
        cerrar();
        if (enfocar)
            boton.current?.focus();
    }
    function elegir(mes) {
        if (mes && !elegible(mes))
            return;
        cerrarSelector();
        if (nativo.current && nativo.current.value !== mes)
            escribirValor(nativo.current, mes);
    }
    function alTeclear(evento) {
        if (!abierto) {
            if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(evento.key)) {
                evento.preventDefault();
                abrirSelector();
                return;
            }
            onKeyDown?.(evento);
            return;
        }
        const numero = Number(activo.slice(5, 7));
        const mover = {
            ArrowLeft: () => sumarMeses(activo, -1),
            ArrowRight: () => sumarMeses(activo, 1),
            ArrowUp: () => sumarMeses(activo, -COLUMNAS),
            ArrowDown: () => sumarMeses(activo, COLUMNAS),
            PageUp: () => sumarMeses(activo, -12),
            PageDown: () => sumarMeses(activo, 12),
            Home: () => sumarMeses(activo, 1 - numero),
            End: () => sumarMeses(activo, 12 - numero),
        };
        if (mover[evento.key]) {
            evento.preventDefault();
            setActivo(acotado(mover[evento.key]()));
        }
        else if (evento.key === 'Enter' || evento.key === ' ') {
            evento.preventDefault();
            elegir(activo);
        }
        else if (evento.key === 'Escape') {
            evento.preventDefault();
            evento.stopPropagation();
            cerrarSelector();
        }
        else if (evento.key === 'Tab') {
            cerrarSelector(false);
        }
    }
    const deHoy = esteMes();
    const año = activo.slice(0, 4);
    const filas = Array.from({ length: 12 / COLUMNAS }, (_, fila) => Array.from({ length: COLUMNAS }, (_, columna) => `${año}-${dosDigitos(fila * COLUMNAS + columna + 1)}`));
    const flecha = 'grid size-8 place-items-center rounded-[7px] text-[var(--n-500)] transition hover:bg-[var(--n-100)] disabled:opacity-30 disabled:hover:bg-transparent';
    const pie = 'rounded-[7px] px-2.5 py-1.5 text-xs font-semibold text-[var(--accent-strong)] transition hover:bg-[var(--n-100)]';
    return (_jsxs(_Fragment, { children: [_jsxs("button", { ...botonProps, ref: boton, type: "button", role: "combobox", "aria-haspopup": "grid", "aria-expanded": abierto, "aria-controls": abierto ? id : undefined, "aria-activedescendant": abierto ? `${id}-${activo}` : undefined, disabled: disabled, onClick: () => (abierto ? cerrarSelector() : abrirSelector()), onKeyDown: alTeclear, onBlur: (evento) => {
                    if (abierto)
                        cerrarSelector(false);
                    onBlur?.(evento);
                }, "data-variante": variante, className: unir(CLASES_DE_CAMPO[variante], 'flex cursor-pointer items-center gap-2 text-left tabular-nums', className, invalido && 'border-[var(--accent)] bg-[var(--accent-soft)]'), children: [_jsx("span", { className: unir('min-w-0 flex-1 truncate', !actual && 'text-[var(--n-500)]'), children: MES.test(actual) ? escrito(actual) : placeholder }), _jsx(Icono, { nombre: "calendario", grosor: 2, className: unir('size-4 shrink-0 text-[var(--n-500)]', variante === 'compacto' && 'size-3.5') })] }), _jsx("input", { ref: nativo, type: "month", name: name, form: form, required: required, min: min, max: max, value: controlado ? value : undefined, defaultValue: controlado ? undefined : defaultValue, onChange: (evento) => {
                    if (!controlado)
                        setPropio(evento.target.value);
                    setInvalido(false);
                    onChange?.(evento);
                }, onInvalid: () => setInvalido(true), disabled: disabled, tabIndex: -1, "aria-hidden": true, className: "sr-only" }), _jsxs(Flotante, { ancla: boton, flotante: flotante, className: "p-3", children: [_jsxs("div", { className: "mb-2 flex items-center justify-between", children: [_jsx("button", { type: "button", "aria-label": "Año anterior", className: flecha, disabled: !!min && `${año}-01` <= min, onClick: () => setActivo(acotado(sumarMeses(activo, -12))), children: _jsx(Icono, { nombre: "izquierda", grosor: 2, className: "size-4" }) }), _jsx("span", { className: "font-semibold tabular-nums", children: año }), _jsx("button", { type: "button", "aria-label": "Año siguiente", className: flecha, disabled: !!max && `${año}-12` >= max, onClick: () => setActivo(acotado(sumarMeses(activo, 12))), children: _jsx(Icono, { nombre: "derecha", grosor: 2, className: "size-4" }) })] }), _jsx("div", { id: id, role: "grid", "aria-label": año, className: "grid gap-0.5", children: filas.map((fila, i) => (_jsx("div", { role: "row", className: "grid grid-cols-3 gap-0.5", children: fila.map((mes) => (_jsx("div", { id: `${id}-${mes}`, role: "gridcell", "aria-label": escrito(mes), "aria-selected": mes === actual, "aria-disabled": !elegible(mes) || undefined, onMouseMove: () => elegible(mes) && mes !== activo && setActivo(mes), onClick: () => elegir(mes), className: unir('grid h-9 cursor-pointer place-items-center rounded-[7px]', mes === activo && 'bg-[var(--n-100)]', mes === deHoy && 'font-semibold text-[var(--accent-strong)]', mes === actual && 'bg-[var(--accent)] font-semibold text-white', !elegible(mes) && 'cursor-not-allowed opacity-35'), children: MESES[Number(mes.slice(5, 7)) - 1].slice(0, 3) }, mes))) }, i))) }), _jsxs("div", { className: "mt-2 flex justify-between border-t border-[var(--border)] pt-2", children: [!required && actual ? (_jsx("button", { type: "button", className: pie, onClick: () => elegir(''), children: "Borrar" })) : (_jsx("span", {})), elegible(deHoy) && (_jsx("button", { type: "button", className: pie, onClick: () => elegir(deHoy), children: "Este mes" }))] })] })] }));
}
