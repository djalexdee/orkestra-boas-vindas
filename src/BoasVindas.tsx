"use client";

import { useEffect, useRef, type KeyboardEvent } from "react";
import { acaoDoPasso, teclaDispensa } from "./decidir.js";

export type PassoDoTour = {
  ancora: string;
  titulo: string;
  texto: string;
};

export type StatusDasBoasVindas = "fechado" | "boas-vindas" | "tour";

export type Rotulos = {
  comecar: string;
  dispensar: string;
  anterior: string;
  proximo: string;
  concluir: string;
  /** O passo pediu uma âncora que não está no documento. */
  semAlvo: string;
};

export type PropsDasBoasVindas = {
  status: StatusDasBoasVindas;
  /** Índice controlado pelo pai. O pacote não o guarda. */
  passo: number;
  passos: PassoDoTour[];
  titulo: string;
  texto: string;
  rotulos: Rotulos;
  onComplete: () => void;
  onDismiss: () => void;
  onPasso: (indice: number) => void;
};

function aoTeclar(
  evento: KeyboardEvent<HTMLDivElement>,
  caixa: HTMLDivElement | null,
  onDismiss: () => void,
) {
  if (teclaDispensa(evento.key)) {
    evento.preventDefault();
    onDismiss();
    return;
  }
  if (evento.key !== "Tab" || !caixa) return;
  const botoes = [...caixa.querySelectorAll<HTMLButtonElement>("button")];
  const primeiro = botoes[0];
  const ultimo = botoes[botoes.length - 1];
  if (!primeiro || !ultimo) return;
  if (!evento.shiftKey && document.activeElement === ultimo) {
    evento.preventDefault();
    primeiro.focus();
  } else if (evento.shiftKey && document.activeElement === primeiro) {
    evento.preventDefault();
    ultimo.focus();
  }
}

export function BoasVindas(props: PropsDasBoasVindas) {
  const caixa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (props.status === "fechado") return;
    caixa.current?.querySelector<HTMLButtonElement>("button")?.focus();
  }, [props.status, props.passo]);

  if (props.status === "fechado") return null;

  const teclado = (evento: KeyboardEvent<HTMLDivElement>) =>
    aoTeclar(evento, caixa.current, props.onDismiss);

  if (props.status === "boas-vindas") {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ork-bv-titulo"
        ref={caixa}
        className="ork-bv"
        onKeyDown={teclado}
      >
        <h2 id="ork-bv-titulo">{props.titulo}</h2>
        <p>{props.texto}</p>
        <button type="button" onClick={props.onDismiss}>
          {props.rotulos.dispensar}
        </button>
        <button
          type="button"
          data-primario="true"
          onClick={() => {
            if (props.passos.length === 0) props.onComplete();
            else props.onPasso(0);
          }}
        >
          {props.rotulos.comecar}
        </button>
      </div>
    );
  }

  const atual = props.passos[props.passo];
  if (!atual) return null;

  const alvo =
    typeof document === "undefined"
      ? null
      : document.querySelector(`[data-tour="${CSS.escape(atual.ancora)}"]`);
  const acao = acaoDoPasso(props.passo, props.passos.length);

  return (
    <div
      role="dialog"
      aria-modal="true"
      ref={caixa}
      className="ork-bv"
      data-ancora={alvo ? atual.ancora : ""}
      onKeyDown={teclado}
    >
      <h2>{alvo ? atual.titulo : props.rotulos.semAlvo}</h2>
      {alvo ? <p>{atual.texto}</p> : null}
      {props.passo > 0 ? (
        <button type="button" onClick={() => props.onPasso(props.passo - 1)}>
          {props.rotulos.anterior}
        </button>
      ) : null}
      <button type="button" onClick={props.onDismiss}>
        {props.rotulos.dispensar}
      </button>
      <button
        type="button"
        data-primario="true"
        onClick={() => {
          if (acao.tipo === "concluir") props.onComplete();
          else props.onPasso(acao.indice);
        }}
      >
        {acao.tipo === "concluir" ? props.rotulos.concluir : props.rotulos.proximo}
      </button>
    </div>
  );
}
