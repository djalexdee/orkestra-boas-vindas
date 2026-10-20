/** O que o botão primário faz. O índice seguinte volta para o pai; daqui não sai estado. */
export type AcaoDoPasso =
  | { tipo: "proximo"; indice: number }
  | { tipo: "concluir" };

/**
 * Último passo conclui. Qualquer índice fora da lista também conclui:
 * avançar para um passo que não existe seria o pacote inventando destino.
 */
export function acaoDoPasso(indice: number, total: number): AcaoDoPasso {
  if (!Number.isInteger(indice) || indice < 0 || total < 1 || indice >= total - 1) {
    return { tipo: "concluir" };
  }
  return { tipo: "proximo", indice: indice + 1 };
}

/** Esc dispensa. Outra tecla não decide nada: o pai é quem conclui. */
export function teclaDispensa(tecla: string): boolean {
  return tecla === "Escape";
}
