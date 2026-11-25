'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import * as React from 'react';
import { CLASES_DE_CAMPO } from './campo.js';
import { escribirValor, Flotante, useFlotante } from './flotante.js';
import { Icono } from './iconos.js';
import { unir } from './unir.js';
export const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DIAS = ['lu', 'ma', 'mi', 'ju', 'vi', 'sá', 'do'];
const aUtc = (fecha) => new Date(`${fecha}T00:00:00Z`);
const deUtc = (d) => d.toISOString().slice(0, 10);
const sumarDias = (fecha, dias) => deUtc(new Date(aUtc(fecha).getTime() + dias * 86400000));
function sumarMeses(fecha, meses) {
    const d = aUtc(fecha);
    const destino = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + meses, 1));
    const largo = new Date(Date.UTC(destino.getUTCFullYear(), destino.getUTCMonth() + 1, 0)).getUTCDate();
    destino.setUTCDate(Math.min(d.getUTCDate(), largo));
    return deUtc(destino);
}
/** Monday is 0. */
const diaDeLaSemana = (fecha) => (aUtc(fecha).getUTCDay() + 6) % 7;
function hoy() {
    const d = new Date();
    return deUtc(new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())));
}
const escrita = (fecha) => `${fecha.slice(8, 10)}/${fecha.slice(5, 7)}/${fecha.slice(0, 4)}`;
const FECHA = /^\d{4}-\d{2}-\d{2}$/;
/** The weeks of the month of `fecha`, Monday first; null pads the first and last. */
function semanasDelMes(fecha) {
    const primero = `${fecha.slice(0, 7)}-01`;
    const dias = Array.from({ length: diaDeLaSemana(primero) }, () => null);
    for (let d = primero; d.slice(0, 7) === primero.slice(0, 7); d = sumarDias(d, 1))
        dias.push(d);
    while (dias.length % 7)
        dias.push(null);
    return Array.from({ length: dias.length / 7 }, (_, i) => dias.slice(i * 7, i * 7 + 7));
}
/**
 * A date field with our own calendar, on every device. Used like
 * `<input type="date">`: `value`/`defaultValue` and `onChange(event)` with
 * `e.target.value` as `AAAA-MM-DD`, `min`, `max`, `name`, `form`, `required`.
 * A hidden native date input keeps the value, posts it and validates it.
 */
export function CampoDeFecha({ value, defaultValue, onChange, name, form, required, min, max, placeholder = 'dd/mm/aaaa', variante = 'campo', className, disabled, onKeyDown, onBlur, ...botonProps }) {
    const controlado = value !== undefined;
    const [propio, setPropio] = React.useState(defaultValue ?? '');
    const actual = controlado ? value : propio;
    const [invalido, setInvalido] = React.useState(false);
    const [activa, setActiva] = React.useState(() => hoy());
    const boton = React.useRef(null);
    const nativo = React.useRef(null);
    const flotante = useFlotante(boton, { anchoMinimo: 280, alto: 380 });
    const { abierto, abrir, cerrar } = flotante;
    const id = React.useId();
    const elegible = (fecha) => (!min || fecha >= min) && (!max || fecha <= max);
    const acotada = (fecha) => (min && fecha < min ? min : max && fecha > max ? max : fecha);
    function abrirCalendario() {
        setActiva(acotada(FECHA.test(actual) ? actual : hoy()));
        abrir();
    }
    function cerrarCalendario(enfocar = true) {
        cerrar();
        if (enfocar)
            boton.current?.focus();
    }
    function elegir(fecha) {
        if (fecha && !elegible(fecha))
            return;
        cerrarCalendario();
        if (nativo.current && nativo.current.value !== fecha)
            escribirValor(nativo.current, fecha);
    }
    function alTeclear(evento) {
        if (!abierto) {
            if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(evento.key)) {
                evento.preventDefault();
                abrirCalendario();
                return;
            }
            onKeyDown?.(evento);
            return;
        }
        const mover = {
            ArrowLeft: () => sumarDias(activa, -1),
            ArrowRight: () => sumarDias(activa, 1),
            ArrowUp: () => sumarDias(activa, -7),
            ArrowDown: () => sumarDias(activa, 7),
            PageUp: () => sumarMeses(activa, -1),
            PageDown: () => sumarMeses(activa, 1),
            Home: () => sumarDias(activa, -diaDeLaSemana(activa)),
            End: () => sumarDias(activa, 6 - diaDeLaSemana(activa)),
        };
        if (mover[evento.key]) {
            evento.preventDefault();
            setActiva(acotada(mover[evento.key]()));
        }
        else if (evento.key === 'Enter' || evento.key === ' ') {
            evento.preventDefault();
            elegir(activa);
        }
        else if (evento.key === 'Escape') {
            evento.preventDefault();
            evento.stopPropagation();
            cerrarCalendario();
        }
        else if (evento.key === 'Tab') {
            cerrarCalendario(false);
        }
    }
    const deHoy = hoy();
    const primeroDelMes = `${activa.slice(0, 7)}-01`;
    const primeroDelSiguiente = sumarMeses(primeroDelMes, 1);
    const flecha = 'grid size-8 place-items-center rounded-[7px] text-[var(--n-500)] transition hover:bg-[var(--n-100)] disabled:opacity-30 disabled:hover:bg-transparent';
    const pie = 'rounded-[7px] px-2.5 py-1.5 text-xs font-semibold text-[var(--accent-strong)] transition hover:bg-[var(--n-100)]';
    return (_jsxs(_Fragment, { children: [_jsxs("button", { ...botonProps, ref: boton, type: "button", role: "combobox", "aria-haspopup": "grid", "aria-expanded": abierto, "aria-controls": abierto ? id : undefined, "aria-activedescendant": abierto ? `${id}-${activa}` : undefined, disabled: disabled, onClick: () => (abierto ? cerrarCalendario() : abrirCalendario()), onKeyDown: alTeclear, onBlur: (evento) => {
                    if (abierto)
                        cerrarCalendario(false);
                    onBlur?.(evento);
                }, "data-variante": variante, className: unir(CLASES_DE_CAMPO[variante], 'flex cursor-pointer items-center gap-2 text-left tabular-nums', className, invalido && 'border-[var(--accent)] bg-[var(--accent-soft)]'), children: [_jsx("span", { className: unir('min-w-0 flex-1 truncate', !actual && 'text-[var(--n-500)]'), children: actual ? escrita(actual) : placeholder }), _jsx(Icono, { nombre: "calendario", grosor: 2, className: unir('size-4 shrink-0 text-[var(--n-500)]', variante === 'compacto' && 'size-3.5') })] }), _jsx("input", { ref: nativo, type: "date", name: name, form: form, required: required, min: min, max: max, value: controlado ? value : undefined, defaultValue: controlado ? undefined : defaultValue, onChange: (evento) => {
                    if (!controlado)
                        setPropio(evento.target.value);
                    setInvalido(false);
                    onChange?.(evento);
                }, onInvalid: () => setInvalido(true), disabled: disabled, tabIndex: -1, "aria-hidden": true, className: "sr-only" }), _jsxs(Flotante, { ancla: boton, flotante: flotante, className: "p-3", children: [_jsxs("div", { className: "mb-2 flex items-center justify-between", children: [_jsx("button", { type: "button", "aria-label": "Mes anterior", className: flecha, disabled: !!min && primeroDelMes <= min, onClick: () => setActiva(acotada(sumarMeses(activa, -1))), children: _jsx(Icono, { nombre: "izquierda", grosor: 2, className: "size-4" }) }), _jsxs("span", { className: "font-semibold", children: [MESES[Number(activa.slice(5, 7)) - 1], " ", activa.slice(0, 4)] }), _jsx("button", { type: "button", "aria-label": "Mes siguiente", className: flecha, disabled: !!max && primeroDelSiguiente > max, onClick: () => setActiva(acotada(sumarMeses(activa, 1))), children: _jsx(Icono, { nombre: "derecha", grosor: 2, className: "size-4" }) })] }), _jsxs("div", { id: id, role: "grid", "aria-label": `${MESES[Number(activa.slice(5, 7)) - 1]} ${activa.slice(0, 4)}`, className: "grid gap-0.5", children: [_jsx("div", { role: "row", className: "grid grid-cols-7 text-center text-[10.5px] font-semibold uppercase text-[var(--n-400)]", children: DIAS.map((d) => (_jsx("span", { role: "columnheader", className: "py-1", children: d }, d))) }), semanasDelMes(activa).map((semana, i) => (_jsx("div", { role: "row", className: "grid grid-cols-7 gap-0.5", children: semana.map((fecha, j) => fecha ? (_jsx("div", { id: `${id}-${fecha}`, role: "gridcell", "aria-selected": fecha === actual, "aria-disabled": !elegible(fecha) || undefined, onMouseMove: () => elegible(fecha) && fecha !== activa && setActiva(fecha), onClick: () => elegir(fecha), className: unir('grid h-8 cursor-pointer place-items-center rounded-[7px] tabular-nums', fecha === activa && 'bg-[var(--n-100)]', fecha === deHoy && 'font-semibold text-[var(--accent-strong)]', fecha === actual && 'bg-[var(--accent)] font-semibold text-white', !elegible(fecha) && 'cursor-not-allowed opacity-35'), children: Number(fecha.slice(8, 10)) }, fecha)) : (_jsx("span", {}, `vacio-${j}`))) }, i)))] }), _jsxs("div", { className: "mt-2 flex justify-between border-t border-[var(--border)] pt-2", children: [!required && actual ? (_jsx("button", { type: "button", className: pie, onClick: () => elegir(''), children: "Borrar" })) : (_jsx("span", {})), elegible(deHoy) && (_jsx("button", { type: "button", className: pie, onClick: () => elegir(deHoy), children: "Hoy" }))] })] })] }));
}
