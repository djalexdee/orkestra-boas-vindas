# @orkestra-ai/boas-vindas

Modal de boas-vindas e tour para os fronts da suíte. O pacote não guarda o passo, não chama o Padlock e não traz textos: quem monta passa `status`, `passo` e os rótulos, e recebe `onComplete`, `onDismiss` e `onPasso`.

As cores são `var(--color-*)`. O estilo entra com `@orkestra-ai/boas-vindas/estilo.css`.

Os passos se ancoram em `data-tour`. Âncora ausente no documento não inventa alvo.
