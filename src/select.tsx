"use client";

import * as React from "react";
import { CLASES_DE_CAMPO } from "./campo.js";
import { escribirValor, Flotante, plegar, useFlotante } from "./flotante.js";
import { Icono } from "./iconos.js";
import { unir } from "./unir.js";

type SelectOption = {
  value: string;
  label: string;
  disabled: boolean;
  group: string | null;
};

/**
 * `campo`: the Portal's form field. `compacto`: a field in a data-grid cell.
 * `pastilla`: a compact uppercase pill for a data-grid cell; it brings neutral
 * colours, the app passes its own in `className` (`bg-ok-soft text-ok border-ok-border`).
 */
export type VarianteDeSelect = "campo" | "compacto" | "pastilla";

export type SelectProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "value" | "defaultValue" | "onChange" | "type" | "name" | "form"
> &
  Pick<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    "value" | "defaultValue" | "onChange" | "name" | "form" | "required" | "autoComplete"
  > & {
    defaultOpen?: boolean;
    variante?: VarianteDeSelect;
  };

const ESTILOS_DEL_BOTON: Record<VarianteDeSelect, string> = {
  campo: unir(CLASES_DE_CAMPO.campo, "flex cursor-pointer items-center gap-2 text-left"),
  compacto: unir(CLASES_DE_CAMPO.compacto, "flex cursor-pointer items-center gap-1 text-left"),
  pastilla:
    "inline-flex h-7 max-w-full cursor-pointer items-center gap-1.5 rounded-full border border-transparent bg-[var(--n-100)] px-3 text-left text-[11px] font-black uppercase tracking-[0.12em] text-[var(--n-700)] outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] disabled:cursor-not-allowed disabled:opacity-55",
};

function textOf(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return textOf(node.props.children);
  }
  return "";
}

function collectOptions(
  children: React.ReactNode,
  group: string | null = null,
  options: SelectOption[] = [],
) {
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;

    if (child.type === React.Fragment) {
      collectOptions(
        (child.props as { children?: React.ReactNode }).children,
        group,
        options,
      );
      return;
    }

    if (child.type === "optgroup") {
      const props = child.props as React.OptgroupHTMLAttributes<HTMLOptGroupElement>;
      collectOptions(props.children, props.label ?? null, options);
      return;
    }

    if (child.type === "option") {
      const props = child.props as React.OptionHTMLAttributes<HTMLOptionElement>;
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

const TYPEAHEAD_RESET_MS = 700;

/**
 * The Portal's select: a drop-in `<select>` (same `<option>`/`<optgroup>`
 * children, `value`/`defaultValue`, `onChange(event)`, `name`, `form`,
 * `required`) whose open list is ours on every device. A hidden native
 * `<select>` keeps the value, posts it with the form, validates `required` and
 * fires the real `change` event. The list goes to `<body>` with fixed
 * positioning, above the `Marco` drawer and the modals.
 */
export function Select({
  className,
  children,
  value,
  defaultValue,
  onChange,
  name,
  required,
  form,
  autoComplete,
  disabled,
  autoFocus,
  defaultOpen = false,
  variante = "campo",
  onKeyDown,
  onBlur,
  ...buttonProps
}: SelectProps) {
  const options = React.useMemo(() => collectOptions(children), [children]);
  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = React.useState(
    defaultValue != null ? String(defaultValue) : undefined,
  );
  const currentValue = isControlled ? String(value) : uncontrolledValue;
  const selectedOption =
    options.find((option) => option.value === currentValue) ??
    options.find((option) => !option.disabled);

  const [invalid, setInvalid] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const selectRef = React.useRef<HTMLSelectElement>(null);
  const flotante = useFlotante(triggerRef);
  const { abierto: open, abrir, cerrar } = flotante;
  const typeaheadRef = React.useRef({ query: "", timeout: 0 });
  const listboxId = React.useId();

  const openList = React.useCallback(
    (index?: number) => {
      if (!triggerRef.current) return;
      const selectedIndex = options.findIndex(
        (option) => option.value === selectedOption?.value,
      );
      setActiveIndex(index ?? Math.max(0, selectedIndex));
      abrir();
    },
    [options, selectedOption, abrir],
  );

  const closeList = React.useCallback(
    (refocus = true) => {
      cerrar();
      if (refocus) triggerRef.current?.focus();
    },
    [cerrar],
  );

  function pick(option: SelectOption) {
    if (option.disabled) return;
    closeList();

    const select = selectRef.current;
    if (select && select.value !== option.value) escribirValor(select, option.value);
  }

  function moveActive(from: number, step: 1 | -1) {
    for (
      let index = from + step;
      index >= 0 && index < options.length;
      index += step
    ) {
      if (!options[index].disabled) return index;
    }
    return from;
  }

  function findByTypeahead(key: string) {
    const typeahead = typeaheadRef.current;
    window.clearTimeout(typeahead.timeout);
    typeahead.query += plegar(key);
    typeahead.timeout = window.setTimeout(() => {
      typeahead.query = "";
    }, TYPEAHEAD_RESET_MS);
    return options.findIndex(
      (option) =>
        !option.disabled && plegar(option.label).startsWith(typeahead.query),
    );
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === " " && typeaheadRef.current.query) {
      event.preventDefault();
      const index = findByTypeahead(event.key);
      if (index >= 0) setActiveIndex(index);
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
        if (index >= 0) openList(index);
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
        if (options[activeIndex]) pick(options[activeIndex]);
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
          if (index >= 0) setActiveIndex(index);
        }
    }
  }

  React.useEffect(() => {
    if (autoFocus || defaultOpen) triggerRef.current?.focus();
    if (defaultOpen) openList();
    // Only on mount, like the native autoFocus.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (isControlled) return;
    const formElement = selectRef.current?.form;
    if (!formElement) return;

    function handleReset() {
      window.setTimeout(() => setUncontrolledValue(selectRef.current?.value));
    }

    formElement.addEventListener("reset", handleReset);
    return () => formElement.removeEventListener("reset", handleReset);
  }, [isControlled]);

  React.useEffect(() => {
    if (!open) return;
    flotante.panel.current
      ?.querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex, flotante.panel]);

  const isPlaceholder = !selectedOption || selectedOption.value === "";
  const groupHeaders = options.map((option, index) =>
    option.group && option.group !== options[index - 1]?.group ? option.group : null,
  );

  return (
    <>
      <button
        {...buttonProps}
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={
          open && activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined
        }
        disabled={disabled}
        onClick={() => (open ? closeList() : openList())}
        onKeyDown={handleKeyDown}
        onBlur={(event) => {
          if (open) closeList(false);
          onBlur?.(event);
        }}
        data-variante={variante}
        className={unir(
          ESTILOS_DEL_BOTON[variante],
          className,
          invalid && "border-[var(--accent)] bg-[var(--accent-soft)]",
        )}
      >
        <span
          className={unir(
            "min-w-0 flex-1 truncate",
            isPlaceholder && variante !== "pastilla" && "text-[var(--n-500)]",
          )}
        >
          {selectedOption?.label ?? ""}
        </span>
        <Icono
          nombre="abajo"
          grosor={2}
          className={unir(
            "size-4 shrink-0 text-[var(--n-500)] transition-transform",
            variante === "pastilla" && "size-3.5 text-current",
            variante === "compacto" && "size-3.5",
            open && "rotate-180",
          )}
        />
      </button>
      <select
        ref={selectRef}
        name={name}
        value={value}
        defaultValue={defaultValue}
        onChange={(event) => {
          if (!isControlled) setUncontrolledValue(event.target.value);
          setInvalid(false);
          onChange?.(event);
        }}
        onInvalid={() => setInvalid(true)}
        required={required}
        form={form}
        autoComplete={autoComplete}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden
        className="sr-only"
      >
        {children}
      </select>
      <Flotante ancla={triggerRef} flotante={flotante} id={listboxId} role="listbox">
        {options.map((option, index) => {
          const groupHeader = groupHeaders[index];
          const isSelected = option.value === selectedOption?.value;

          return (
            <React.Fragment key={`${option.group ?? ""}-${option.value}-${index}`}>
              {groupHeader ? (
                <div className="px-2.5 pb-1 pt-2.5 text-[10.5px] font-semibold uppercase tracking-[0.07em] text-[var(--n-400)]">
                  {groupHeader}
                </div>
              ) : null}
              <div
                id={`${listboxId}-${index}`}
                data-index={index}
                role="option"
                aria-selected={isSelected}
                aria-disabled={option.disabled || undefined}
                onMouseMove={() => {
                  if (!option.disabled && activeIndex !== index) {
                    setActiveIndex(index);
                  }
                }}
                onClick={() => pick(option)}
                className={unir(
                  "flex cursor-pointer items-center gap-2 rounded-[7px] px-2.5 py-2",
                  index === activeIndex && "bg-[var(--n-100)]",
                  isSelected && "font-semibold text-[var(--accent-strong)]",
                  option.value === "" && !isSelected && "text-[var(--n-500)]",
                  option.disabled && "cursor-not-allowed opacity-50",
                )}
              >
                <span className="min-w-0 flex-1">{option.label}</span>
                {isSelected ? (
                  <Icono nombre="elegida" grosor={2} className="size-4 shrink-0 text-[var(--accent)]" />
                ) : null}
              </div>
            </React.Fragment>
          );
        })}
      </Flotante>
    </>
  );
}

/** Alias of `Select`. v0.6.0's `Selector` props (`valor`, `onCambiar`, `opciones`) are gone. */
export const Selector = Select;
