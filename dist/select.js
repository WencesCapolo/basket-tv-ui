"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import * as React from "react";
import { createPortal } from "react-dom";
import { Icono } from "./iconos.js";
import { unir } from "./unir.js";
const ESTILOS_DEL_BOTON = {
    campo: "flex w-full cursor-pointer items-center gap-2 rounded-[var(--panel-radius)] border border-[var(--border)] bg-[var(--background-soft)] px-4 py-3 text-left text-sm text-[var(--foreground)] outline-none transition hover:border-[var(--n-300)] focus:border-[var(--accent)] focus:bg-[var(--surface)] focus:ring-4 focus:ring-[rgba(230,18,56,0.08)] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:border-[var(--border)]",
    pastilla: "inline-flex h-7 max-w-full cursor-pointer items-center gap-1.5 rounded-full border border-transparent bg-[var(--n-100)] px-3 text-left text-[11px] font-black uppercase tracking-[0.12em] text-[var(--n-700)] outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] disabled:cursor-not-allowed disabled:opacity-55",
};
const POPOVER_GAP = 6;
const POPOVER_MAX_HEIGHT = 288;
const TYPEAHEAD_RESET_MS = 700;
function textOf(node) {
    if (node == null || typeof node === "boolean")
        return "";
    if (typeof node === "string" || typeof node === "number")
        return String(node);
    if (Array.isArray(node))
        return node.map(textOf).join("");
    if (React.isValidElement(node)) {
        return textOf(node.props.children);
    }
    return "";
}
function collectOptions(children, group = null, options = []) {
    React.Children.forEach(children, (child) => {
        if (!React.isValidElement(child))
            return;
        if (child.type === React.Fragment) {
            collectOptions(child.props.children, group, options);
            return;
        }
        if (child.type === "optgroup") {
            const props = child.props;
            collectOptions(props.children, props.label ?? null, options);
            return;
        }
        if (child.type === "option") {
            const props = child.props;
            const label = textOf(props.children).trim();
            options.push({
                value: props.value != null ? String(props.value) : label,
                label,
                disabled: Boolean(props.disabled),
                group,
            });
        }
    });
    return options;
}
function normalizeKey(value) {
    return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}
function computePosition(trigger) {
    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - POPOVER_GAP * 2;
    const spaceAbove = rect.top - POPOVER_GAP * 2;
    const width = Math.max(rect.width, 180);
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
    if (spaceBelow < 200 && spaceAbove > spaceBelow) {
        return {
            left,
            width,
            bottom: window.innerHeight - rect.top + POPOVER_GAP,
            maxHeight: Math.min(POPOVER_MAX_HEIGHT, spaceAbove),
        };
    }
    return {
        left,
        width,
        top: rect.bottom + POPOVER_GAP,
        maxHeight: Math.min(POPOVER_MAX_HEIGHT, spaceBelow),
    };
}
/**
 * The Portal's select: a drop-in `<select>` (same `<option>`/`<optgroup>`
 * children, `value`/`defaultValue`, `onChange(event)`, `name`, `form`,
 * `required`) whose open list is ours on every device. A hidden native
 * `<select>` keeps the value, posts it with the form, validates `required` and
 * fires the real `change` event. The list goes to `<body>` with fixed
 * positioning, above the `Marco` drawer and the modals.
 */
export function Select({ className, children, value, defaultValue, onChange, name, required, form, autoComplete, disabled, autoFocus, defaultOpen = false, variante = "campo", onKeyDown, onBlur, ...buttonProps }) {
    const options = React.useMemo(() => collectOptions(children), [children]);
    const isControlled = value !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue != null ? String(defaultValue) : undefined);
    const currentValue = isControlled ? String(value) : uncontrolledValue;
    const selectedOption = options.find((option) => option.value === currentValue) ??
        options.find((option) => !option.disabled);
    const [open, setOpen] = React.useState(false);
    const [invalid, setInvalid] = React.useState(false);
    const [activeIndex, setActiveIndex] = React.useState(-1);
    const [position, setPosition] = React.useState(null);
    const triggerRef = React.useRef(null);
    const selectRef = React.useRef(null);
    const listRef = React.useRef(null);
    const typeaheadRef = React.useRef({ query: "", timeout: 0 });
    const listboxId = React.useId();
    const openList = React.useCallback((index) => {
        if (!triggerRef.current)
            return;
        const selectedIndex = options.findIndex((option) => option.value === selectedOption?.value);
        setActiveIndex(index ?? Math.max(0, selectedIndex));
        setPosition(computePosition(triggerRef.current));
        setOpen(true);
    }, [options, selectedOption]);
    const closeList = React.useCallback((refocus = true) => {
        setOpen(false);
        if (refocus)
            triggerRef.current?.focus();
    }, []);
    function pick(option) {
        if (option.disabled)
            return;
        closeList();
        const select = selectRef.current;
        if (!select || select.value === option.value)
            return;
        const setNativeValue = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value")?.set;
        setNativeValue?.call(select, option.value);
        select.dispatchEvent(new Event("input", { bubbles: true }));
        select.dispatchEvent(new Event("change", { bubbles: true }));
    }
    function moveActive(from, step) {
        for (let index = from + step; index >= 0 && index < options.length; index += step) {
            if (!options[index].disabled)
                return index;
        }
        return from;
    }
    function findByTypeahead(key) {
        const typeahead = typeaheadRef.current;
        window.clearTimeout(typeahead.timeout);
        typeahead.query += normalizeKey(key);
        typeahead.timeout = window.setTimeout(() => {
            typeahead.query = "";
        }, TYPEAHEAD_RESET_MS);
        return options.findIndex((option) => !option.disabled && normalizeKey(option.label).startsWith(typeahead.query));
    }
    function handleKeyDown(event) {
        if (event.key === " " && typeaheadRef.current.query) {
            event.preventDefault();
            const index = findByTypeahead(event.key);
            if (index >= 0)
                setActiveIndex(index);
            return;
        }
        if (!open) {
            if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
                event.preventDefault();
                openList();
                return;
            }
            if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
                const index = findByTypeahead(event.key);
                if (index >= 0)
                    openList(index);
                return;
            }
            onKeyDown?.(event);
            return;
        }
        switch (event.key) {
            case "ArrowDown":
                event.preventDefault();
                setActiveIndex((index) => moveActive(index, 1));
                break;
            case "ArrowUp":
                event.preventDefault();
                setActiveIndex((index) => moveActive(index, -1));
                break;
            case "Home":
                event.preventDefault();
                setActiveIndex(moveActive(-1, 1));
                break;
            case "End":
                event.preventDefault();
                setActiveIndex(moveActive(options.length, -1));
                break;
            case "Enter":
            case " ":
                event.preventDefault();
                if (options[activeIndex])
                    pick(options[activeIndex]);
                break;
            case "Escape":
                event.preventDefault();
                event.stopPropagation();
                closeList();
                break;
            case "Tab":
                closeList(false);
                break;
            default:
                if (event.key.length === 1) {
                    const index = findByTypeahead(event.key);
                    if (index >= 0)
                        setActiveIndex(index);
                }
        }
    }
    React.useEffect(() => {
        if (autoFocus || defaultOpen)
            triggerRef.current?.focus();
        if (defaultOpen)
            openList();
        // Only on mount, like the native autoFocus.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    React.useEffect(() => {
        if (isControlled)
            return;
        const formElement = selectRef.current?.form;
        if (!formElement)
            return;
        function handleReset() {
            window.setTimeout(() => setUncontrolledValue(selectRef.current?.value));
        }
        formElement.addEventListener("reset", handleReset);
        return () => formElement.removeEventListener("reset", handleReset);
    }, [isControlled]);
    React.useEffect(() => {
        if (!open)
            return;
        function handlePointerDown(event) {
            if (triggerRef.current?.contains(event.target))
                return;
            closeList(false);
        }
        function handleViewportChange(event) {
            if (listRef.current?.contains(event.target))
                return;
            if (triggerRef.current)
                setPosition(computePosition(triggerRef.current));
        }
        document.addEventListener("mousedown", handlePointerDown);
        window.addEventListener("scroll", handleViewportChange, true);
        window.addEventListener("resize", handleViewportChange);
        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            window.removeEventListener("scroll", handleViewportChange, true);
            window.removeEventListener("resize", handleViewportChange);
        };
    }, [open, closeList]);
    React.useEffect(() => {
        if (!open)
            return;
        listRef.current
            ?.querySelector(`[data-index="${activeIndex}"]`)
            ?.scrollIntoView({ block: "nearest" });
    }, [open, activeIndex]);
    const isPlaceholder = !selectedOption || selectedOption.value === "";
    const groupHeaders = options.map((option, index) => option.group && option.group !== options[index - 1]?.group ? option.group : null);
    return (_jsxs(_Fragment, { children: [_jsxs("button", { ...buttonProps, ref: triggerRef, type: "button", role: "combobox", "aria-haspopup": "listbox", "aria-expanded": open, "aria-controls": open ? listboxId : undefined, "aria-activedescendant": open && activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined, disabled: disabled, onClick: () => (open ? closeList() : openList()), onKeyDown: handleKeyDown, onBlur: (event) => {
                    if (open)
                        closeList(false);
                    onBlur?.(event);
                }, "data-variante": variante, className: unir(ESTILOS_DEL_BOTON[variante], className, invalid && "border-[var(--accent)] bg-[var(--accent-soft)]"), children: [_jsx("span", { className: unir("min-w-0 flex-1 truncate", isPlaceholder && variante === "campo" && "text-[var(--n-500)]"), children: selectedOption?.label ?? "" }), _jsx(Icono, { nombre: "abajo", grosor: 2, className: unir("size-4 shrink-0 text-[var(--n-500)] transition-transform", variante === "pastilla" && "size-3.5 text-current", open && "rotate-180") })] }), _jsx("select", { ref: selectRef, name: name, value: value, defaultValue: defaultValue, onChange: (event) => {
                    if (!isControlled)
                        setUncontrolledValue(event.target.value);
                    setInvalid(false);
                    onChange?.(event);
                }, onInvalid: () => setInvalid(true), required: required, form: form, autoComplete: autoComplete, disabled: disabled, tabIndex: -1, "aria-hidden": true, className: "sr-only", children: children }), open && position
                ? createPortal(_jsx("div", { ref: listRef, id: listboxId, role: "listbox", 
                    // Keeps focus on the trigger and hides the click from the outside-click
                    // handlers of the popovers and modals this select lives in.
                    onMouseDown: (event) => {
                        event.preventDefault();
                        event.nativeEvent.stopImmediatePropagation();
                    }, style: {
                        left: position.left,
                        width: position.width,
                        top: position.top,
                        bottom: position.bottom,
                        maxHeight: position.maxHeight,
                    }, className: "fixed z-[400] overflow-y-auto overscroll-contain rounded-[var(--panel-radius)] border border-[var(--border)] bg-[var(--surface)] p-1.5 text-sm text-[var(--foreground)] shadow-[var(--shadow-lift)]", children: options.map((option, index) => {
                        const groupHeader = groupHeaders[index];
                        const isSelected = option.value === selectedOption?.value;
                        return (_jsxs(React.Fragment, { children: [groupHeader ? (_jsx("div", { className: "px-2.5 pb-1 pt-2.5 text-[10.5px] font-semibold uppercase tracking-[0.07em] text-[var(--n-400)]", children: groupHeader })) : null, _jsxs("div", { id: `${listboxId}-${index}`, "data-index": index, role: "option", "aria-selected": isSelected, "aria-disabled": option.disabled || undefined, onMouseMove: () => {
                                        if (!option.disabled && activeIndex !== index) {
                                            setActiveIndex(index);
                                        }
                                    }, onClick: () => pick(option), className: unir("flex cursor-pointer items-center gap-2 rounded-[7px] px-2.5 py-2", index === activeIndex && "bg-[var(--n-100)]", isSelected && "font-semibold text-[var(--accent-strong)]", option.value === "" && !isSelected && "text-[var(--n-500)]", option.disabled && "cursor-not-allowed opacity-50"), children: [_jsx("span", { className: "min-w-0 flex-1", children: option.label }), isSelected ? (_jsx(Icono, { nombre: "elegida", grosor: 2, className: "size-4 shrink-0 text-[var(--accent)]" })) : null] })] }, `${option.group ?? ""}-${option.value}-${index}`));
                    }) }), document.body)
                : null] }));
}
/** Alias of `Select`. v0.6.0's `Selector` props (`valor`, `onCambiar`, `opciones`) are gone. */
export const Selector = Select;
