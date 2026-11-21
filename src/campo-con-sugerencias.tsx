'use client';

import * as React from 'react';
import { Campo, type CampoProps } from './campo.js';
import { escribirValor, Flotante, plegar, useFlotante } from './flotante.js';
import { unir } from './unir.js';

export type CampoConSugerenciasProps = Omit<CampoProps, 'list' | 'type'> & {
  /** What the list offers. The person can still write anything else. */
  sugerencias: readonly string[];
};

const MAXIMO_A_MOSTRAR = 100;

/**
 * A text field that offers `sugerencias` in our own list while the person
 * writes: the ones that contain what they wrote, ignoring accents and case.
 * Replaces `<input list>` + `<datalist>`. Same props as `Campo`; choosing one
 * fires the real `change` event, so `onChange` reads `e.target.value`.
 */
export function CampoConSugerencias({ sugerencias, value, defaultValue, onChange, onFocus, onBlur, onKeyDown, ref, ...props }: CampoConSugerenciasProps) {
  const controlado = value !== undefined;
  const [propio, setPropio] = React.useState(String(defaultValue ?? ''));
  const texto = controlado ? String(value) : propio;
  const [activa, setActiva] = React.useState(-1);
  const entrada = React.useRef<HTMLInputElement>(null);
  /** While choosing, the `change` it fires is not typing: the list stays closed. */
  const eligiendo = React.useRef(false);
  const flotante = useFlotante(entrada);
  const { abierto, abrir, cerrar } = flotante;
  const id = React.useId();

  const buscado = plegar(texto.trim());
  const visibles = React.useMemo(
    () => sugerencias.filter((s) => plegar(s).includes(buscado) && plegar(s) !== buscado).slice(0, MAXIMO_A_MOSTRAR),
    [sugerencias, buscado],
  );
  const conLista = abierto && visibles.length > 0;

  React.useEffect(() => setActiva(-1), [buscado]);
  React.useEffect(() => {
    if (conLista && activa >= 0) flotante.panel.current?.querySelector(`[data-index="${activa}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [conLista, activa, flotante.panel]);

  function elegir(sugerencia: string) {
    cerrar();
    if (!entrada.current || entrada.current.value === sugerencia) return;
    eligiendo.current = true;
    escribirValor(entrada.current, sugerencia);
    eligiendo.current = false;
  }

  function alTeclear(evento: React.KeyboardEvent<HTMLInputElement>) {
    if (evento.key === 'ArrowDown' || evento.key === 'ArrowUp') {
      evento.preventDefault();
      if (!abierto) return abrir();
      const paso = evento.key === 'ArrowDown' ? 1 : -1;
      setActiva((i) => Math.max(-1, Math.min(visibles.length - 1, i + paso)));
    } else if (evento.key === 'Enter' && conLista && activa >= 0) {
      evento.preventDefault();
      elegir(visibles[activa]!);
    } else if (evento.key === 'Escape' && conLista) {
      evento.preventDefault();
      evento.stopPropagation();
      cerrar();
    } else if (evento.key === 'Tab') {
      cerrar();
    }
    onKeyDown?.(evento);
  }

  return (
    <>
      <Campo
        {...props}
        ref={(nodo) => {
          entrada.current = nodo;
          if (typeof ref === 'function') ref(nodo);
          else if (ref) ref.current = nodo;
        }}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={conLista}
        aria-controls={conLista ? id : undefined}
        aria-activedescendant={conLista && activa >= 0 ? `${id}-${activa}` : undefined}
        autoComplete="off"
        value={controlado ? value : undefined}
        defaultValue={controlado ? undefined : defaultValue}
        onChange={(evento) => {
          if (!controlado) setPropio(evento.target.value);
          if (!eligiendo.current) abrir();
          onChange?.(evento);
        }}
        onClick={() => !abierto && abrir()}
        onFocus={(evento) => {
          abrir();
          onFocus?.(evento);
        }}
        onBlur={(evento) => {
          cerrar();
          onBlur?.(evento);
        }}
        onKeyDown={alTeclear}
      />
      {conLista && (
        <Flotante ancla={entrada} flotante={flotante} id={id} role="listbox">
          {visibles.map((sugerencia, i) => (
            <div
              key={sugerencia}
              id={`${id}-${i}`}
              data-index={i}
              role="option"
              aria-selected={i === activa}
              onMouseMove={() => i !== activa && setActiva(i)}
              onClick={() => elegir(sugerencia)}
              className={unir('cursor-pointer rounded-[7px] px-2.5 py-2', i === activa && 'bg-[var(--n-100)]')}
            >
              {sugerencia}
            </div>
          ))}
        </Flotante>
      )}
    </>
  );
}
