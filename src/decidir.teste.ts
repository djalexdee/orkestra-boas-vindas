import assert from "node:assert/strict";
import test from "node:test";
import { acaoDoPasso, teclaDispensa } from "./decidir.ts";

test("o passo do meio pede o índice seguinte", () => {
  assert.deepEqual(acaoDoPasso(0, 3), { tipo: "proximo", indice: 1 });
});

test("o último passo conclui", () => {
  assert.deepEqual(acaoDoPasso(2, 3), { tipo: "concluir" });
});

test("Esc dispensa e Enter não", () => {
  assert.equal(teclaDispensa("Escape"), true);
  assert.equal(teclaDispensa("Enter"), false);
});
