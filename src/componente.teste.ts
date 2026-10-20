import assert from "node:assert/strict";
import test from "node:test";
import { Window } from "happy-dom";
import { act, createElement, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { BoasVindas, type PropsDasBoasVindas } from "../dist/BoasVindas.js";

const janela = new Window({ url: "https://app.orkestraai.com.br/" });
const globais = globalThis as Record<string, unknown>;
globais.window = janela;
globais.document = janela.document;
globais.HTMLElement = janela.HTMLElement;
globais.Node = janela.Node;
globais.IS_REACT_ACT_ENVIRONMENT = true;
globais.CSS = {
  escape: (valor: string) => valor.replace(/[^a-zA-Z0-9_-]/g, "\\$&"),
};

const rotulos = {
  comecar: "Comecar",
  dispensar: "Dispensar",
  anterior: "Anterior",
  proximo: "Proximo",
  concluir: "Concluir",
  semAlvo: "Este passo nao esta na tela",
};

function props(parcial: Partial<PropsDasBoasVindas> = {}): PropsDasBoasVindas {
  return {
    status: "fechado",
    passo: 0,
    passos: [
      { ancora: "fila", titulo: "A fila", texto: "O que precisa de voce" },
      { ancora: "conta", titulo: "A conta", texto: "Onde voce sai" },
    ],
    titulo: "Bem-vindo",
    texto: "Um tour curto",
    rotulos,
    onComplete: () => {},
    onDismiss: () => {},
    onPasso: () => {},
    ...parcial,
  };
}

async function montar(elemento: ReactElement) {
  const destino = document.createElement("div");
  document.body.appendChild(destino);
  const raiz: Root = createRoot(destino);
  await act(async () => {
    raiz.render(elemento);
  });
  return {
    destino,
    async desmontar() {
      raiz.unmount();
      destino.remove();
    },
  };
}

test("fechado não desenha nada", async () => {
  const tela = await montar(createElement(BoasVindas, props()));
  assert.equal(tela.destino.querySelector("[role=dialog]"), null);
  await tela.desmontar();
});

test("o modal mostra o texto das props e o Esc dispensa uma vez", async () => {
  let dispensas = 0;
  const tela = await montar(
    createElement(
      BoasVindas,
      props({ status: "boas-vindas", onDismiss: () => { dispensas += 1; } }),
    ),
  );
  assert.equal(tela.destino.querySelector("h2")?.textContent, "Bem-vindo");
  assert.match(tela.destino.textContent ?? "", /Um tour curto/);
  const dialogo = tela.destino.querySelector("[role=dialog]");
  assert.ok(dialogo);
  dialogo.dispatchEvent(new janela.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  assert.equal(dispensas, 1);
  await tela.desmontar();
});

test("o próximo pede o índice seguinte e o pai continua dono do passo", async () => {
  const pedidos: number[] = [];
  const fila = document.createElement("div");
  fila.setAttribute("data-tour", "fila");
  document.body.appendChild(fila);
  const tela = await montar(
    createElement(BoasVindas, props({ status: "tour", passo: 0, onPasso: (n) => pedidos.push(n) })),
  );
  assert.equal(tela.destino.querySelector("h2")?.textContent, "A fila");
  tela.destino.querySelector<HTMLButtonElement>("[data-primario]")?.click();
  assert.deepEqual(pedidos, [1]);
  await tela.desmontar();

  const deNovo = await montar(createElement(BoasVindas, props({ status: "tour", passo: 0 })));
  assert.equal(deNovo.destino.querySelector("h2")?.textContent, "A fila");
  await deNovo.desmontar();
});

test("no último passo o botão primário conclui", async () => {
  let concluiu = 0;
  const pedidos: number[] = [];
  const conta = document.createElement("div");
  conta.setAttribute("data-tour", "conta");
  document.body.appendChild(conta);
  const tela = await montar(
    createElement(
      BoasVindas,
      props({
        status: "tour",
        passo: 1,
        onComplete: () => { concluiu += 1; },
        onPasso: (n) => pedidos.push(n),
      }),
    ),
  );
  tela.destino.querySelector<HTMLButtonElement>("[data-primario]")?.click();
  assert.equal(concluiu, 1);
  assert.deepEqual(pedidos, []);
  await tela.desmontar();
});

test("âncora ausente não inventa alvo", async () => {
  const tela = await montar(
    createElement(
      BoasVindas,
      props({
        status: "tour",
        passo: 0,
        passos: [{ ancora: "nao-existe", titulo: "Some", texto: "Nao" }],
      }),
    ),
  );
  assert.equal(tela.destino.querySelector("h2")?.textContent, rotulos.semAlvo);
  assert.equal(tela.destino.querySelector("[data-ancora]")?.getAttribute("data-ancora"), "");
  await tela.desmontar();
});
