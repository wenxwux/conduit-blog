---
title: "Crea un flujo de revisión de código automatizada con Codex"
description: "Una guía práctica para montar una revisión de código automatizada con Codex: comprobaciones pre-commit, integración con CI, prompts de revisión y cómo mantener la señal alta y el ruido bajo."
pubDate: 2026-06-19
tags: ["Codex", "Revisión de código", "Automatización"]
keywords: ["revisión de código con Codex", "revisión de código automatizada", "flujo de CI con Codex"]
draft: false
---

La revisión manual de código es valiosa pero lenta, y los revisores están cansados. La solución no es reemplazar a los humanos, sino poner una pasada de IA por delante de ellos para que lo obvio (fallos silenciosos, casos límite olvidados, deriva de convenciones) se atrape antes de que una persona lo mire siquiera. Llevo un tiempo usando Codex como ese revisor de primera pasada. Aquí tienes la configuración que de verdad aguanta.

## El objetivo: una revisión en dos etapas

El modelo mental que uso:

1. **Etapa 1 — Codex** atrapa automáticamente los problemas mecánicos y a nivel de patrón en cada cambio.
2. **Etapa 2 — un humano** se centra en el diseño, la intención y los juicios que la IA hace mal.

El sentido de la etapa 1 es hacer la etapa 2 *más barata*, no eliminarla. Si Codex señala diez cosas y ocho son reales, tu revisor humano arranca desde un punto mucho mejor.

## Paso 1: Una pasada local pre-commit

Lo más temprano que puedes atrapar un problema es antes de que se haya hecho commit. Conecto Codex a un paso pre-commit que revisa el diff preparado (staged).

```bash
# .git/hooks/pre-commit (o mediante un gestor de hooks)
#!/usr/bin/env bash
DIFF=$(git diff --cached)
if [ -z "$DIFF" ]; then exit 0; fi

echo "$DIFF" | codex review --stdin \
  --focus "bugs,silent-failures,edge-cases" \
  --format markdown > /tmp/codex-review.md

echo "--- Codex review ---"
cat /tmp/codex-review.md
```

Lo mantengo **no bloqueante** por defecto: imprime los hallazgos pero no rechaza el commit. Una barrera bloqueante que se dispara con falsos positivos entrena a la gente a saltársela, lo que arruina el propósito.

## Paso 2: Un prompt de revisión enfocado

La calidad de la revisión es, sobre todo, la calidad del prompt. Un vago "revisa este código" te da una salida vaga. Yo le doy a Codex una rúbrica ajustada:

> Revisa este diff. Reporta solo los problemas de los que estés seguro. Para cada uno, indica: archivo y línea, gravedad (alta/media/baja), el problema en una frase y una solución concreta. Prioriza: fallos silenciosos y errores tragados, manejo de errores ausente, casos límite (null/vacío/frontera) y violaciones de las convenciones existentes del proyecto. **No** comentes el estilo que el formateador ya gestiona. Si el diff está limpio, dilo.

Esa última instrucción importa: decirle que se calle cuando no hay nada que decir es lo que mantiene el ruido bajo.

## Paso 3: Conéctalo a la CI

Los hooks locales ayudan, pero la CI es donde se convierte en un hábito de equipo. En cada pull request ejecuto un trabajo de revisión y publico el resultado como comentario del PR.

```yaml
# .github/workflows/codex-review.yml
name: Codex Review
on: [pull_request]
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - name: Run Codex review
        env:
          OPENAI_BASE_URL: ${{ secrets.LLM_BASE_URL }}
          OPENAI_API_KEY: ${{ secrets.LLM_API_KEY }}
        run: |
          git diff origin/${{ github.base_ref }}...HEAD > pr.diff
          codex review --stdin < pr.diff --format markdown > review.md
      - name: Post comment
        run: gh pr comment ${{ github.event.number }} --body-file review.md
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Algunas notas de ejecutar esto en la práctica:

- Apunto `OPENAI_BASE_URL` a un único endpoint de puerta de enlace para que el mismo secreto funcione tanto en los hooks locales como en la CI, y para poder cambiar el modelo subyacente sin tocar el flujo de trabajo.
- `fetch-depth: 0` importa: necesitas el historial completo para hacer diff contra la rama base.
- Mantén la revisión acotada al **diff**, no a todo el repositorio. Revisar código sin cambios desperdicia tokens y entierra los hallazgos reales.

## Paso 4: Ajusta para tener señal

La primera semana recibirás demasiados comentarios de poco valor. Ajústalo:

| Síntoma | Solución |
|---|---|
| Demasiadas nimiedades | Añade "ignora cualquier cosa que cubra el linter/formateador" |
| Señala cosas que ya son intencionales | Aliméntalo con el contexto de la convención/CLAUDE.md pertinente |
| Se pierde bugs reales | Añade categorías explícitas (concurrencia, off-by-one, fugas de recursos) |
| Comentario demasiado largo para leer | Limita la salida: "máximo 8 hallazgos, primero la mayor gravedad" |
 
El dial que estás girando es el **umbral de confianza**. Dile que reporte solo problemas de alta confianza y cambiarás unos pocos detalles menores que se le escapan por un comentario que tu equipo de verdad leerá.

## Qué dejar en manos de los humanos

Nunca dejo que la pasada de IA tome la decisión de merge. Codex es excelente en: excepciones tragadas, nulls sin manejar, bugs de copiar-pegar, manejo de errores inconsistente, casos de prueba ausentes. Es flojo en: si la funcionalidad es la *funcionalidad correcta*, si la abstracción envejecerá bien y si un cambio encaja con el contexto tácito del equipo. Ese es el trabajo del revisor, y ahora tiene la energía para ello porque la pasada mecánica ya se ejecutó.

## Cierre

La victoria aquí no es "la IA revisa mi código", sino una tubería por capas: el pre-commit atrapa lo obvio, la CI lo convierte en una norma de equipo y los humanos invierten su atención donde cuenta. Empieza con el hook local no bloqueante, ajusta el prompt y luego promociónalo a la CI cuando la señal sea buena. En un par de semanas, la pasada de IA se convierte en infraestructura invisible, y tus PR llegan más limpios antes de que nadie los abra.

Lecturas relacionadas: [Subagentes de Claude Code: ejecuta tareas en paralelo de principio a fin](/conduit-blog/es/blog/claude-code-subagents/)
