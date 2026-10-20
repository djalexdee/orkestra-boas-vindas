import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync(new URL("./boas-vindas.css", import.meta.url), "utf8");

test("as cores vêm dos tokens da suíte", () => {
  assert.equal(/#[0-9a-fA-F]{3,8}\b/.test(css), false);
  for (const token of [
    "--color-bg-panel",
    "--color-text-primary",
    "--color-border-default",
    "--color-accent-teal",
    "--color-text-on-accent",
  ]) {
    assert.equal(css.includes(`var(${token})`), true, token);
  }
});
