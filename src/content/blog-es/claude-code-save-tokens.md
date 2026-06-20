---
title: "7 técnicas prácticas para ahorrar tokens en Claude Code"
description: "Tras varios meses usando Claude Code, reuní 7 técnicas que realmente ahorran tokens: desde reducir el contexto hasta elegir el modelo adecuado, para bajar el consumo sin sacrificar resultados."
pubDate: 2026-06-19
tags: ["Claude Code", "ahorrar tokens", "técnicas prácticas"]
keywords: ["ahorrar tokens en Claude Code", "optimizar tokens en Claude Code", "reducir consumo de API"]
draft: false
---

Programar con Claude Code es realmente cómodo, pero al usarlo durante un tiempo te das cuenta de que también quema tokens muy rápido. En un proyecto grande, con unas pocas rondas de conversación el contexto se acumula enormemente. Estas son las 7 técnicas que, tras probarlas yo mismo, demostraron ser realmente efectivas para ahorrar tokens; nada de magia, cada una se puede aplicar de inmediato.

## 1. Usa `/clear` para limpiar el contexto a tiempo

Esta es la más ignorada y, a la vez, la más efectiva. Por defecto, Claude Code envía toda la conversación histórica en cada petición: cuanto más largo el intercambio, más tokens se transmiten en cada ronda, aunque luego preguntes algo nuevo y sin relación.

Al cambiar de tarea, simplemente:

```bash
/clear
```

Una tarea, una conversación. Mi costumbre actual es: en cuanto termino de modificar una funcionalidad, limpio; nunca dejo que un historial irrelevante siga colgando y acumulando coste.

## 2. Usa `.claudeignore` para excluir archivos irrelevantes

Cuando Claude Code lee el proyecto, escanea un montón de archivos, muchos de los cuales no hace falta alimentar al modelo, como directorios de dependencias, artefactos de compilación o registros. Crea un `.claudeignore` (con la misma sintaxis que `.gitignore`):

```
node_modules/
dist/
build/
*.log
.next/
coverage/
```

Así los omitirá automáticamente al escanear y buscar, ganando velocidad y ahorro.

## 3. Indica explícitamente qué archivos leer; no lo dejes "buscar en todo"

Las instrucciones vagas disparan escaneos a gran escala. Compara:

> ❌ "Mira cómo está implementado el inicio de sesión en el proyecto"
>
> ✅ "Lee `src/auth/login.ts` y dime la lógica de esta función"

La segunda localiza directamente el archivo y ahorra toda una ronda de búsqueda. Cuanto más claro tengas qué quieres modificar, menos tokens gastas.

## 4. Escribe un buen CLAUDE.md para reducir explicaciones repetidas

Si cada vez tienes que decirle "este proyecto usa TypeScript, el gestor de paquetes es pnpm, las pruebas usan vitest"... todas estas indicaciones repetidas pueden escribirse una sola vez en el `CLAUDE.md` de la raíz del proyecto. El modelo lo leerá automáticamente y no tendrás que repetir el contexto en cada ronda.

Sobre cómo escribir un CLAUDE.md más práctico, le dediqué un artículo aparte: [Cómo escribir un CLAUDE.md realmente útil](/conduit-blog/es/blog/claude-md-guide/), que puedes leer como complemento.

## 5. Para tareas pequeñas usa Sonnet; no recurras a Opus por todo

No todas las tareas necesitan el modelo más potente. Para los cambios pequeños del día a día, añadir comentarios o escribir pruebas, Sonnet es más que suficiente y tiene un precio unitario mucho más bajo. Solo cuando de verdad hace falta razonamiento complejo o una refactorización a gran escala conviene cambiar a Opus.

Cambiar es muy sencillo:

```bash
/model
```

Elegir bien el modelo es, por sí solo, el mayor ahorro. Para saber cómo elegir según el escenario, consulta [Cómo elegir entre Opus y Sonnet](/conduit-blog/es/blog/opus-vs-sonnet/).

## 6. Divide las tareas largas en pasos pequeños; no las metas todas de golpe

Si le lanzas de una vez "refactoriza todo el proyecto", leerá una cantidad enorme de archivos, generará respuestas larguísimas, los tokens se dispararán y, además, es fácil que se desvíe. Divídelo en pasos pequeños:

1. Primero pídele que enumere el plan de refactorización (solo el plan, sin tocar el código)
2. Cuando lo confirmes, ve modificando módulo por módulo
3. Tras terminar cada uno, haz `/clear` antes de empezar el siguiente

Dividir no solo ahorra tokens, sino que la calidad también es notablemente más estable.

## 7. Aprovecha la caché: no retransmitas una y otra vez el contexto repetido

Si dentro de una misma conversación haces referencia repetidamente al mismo conjunto de archivos, el mecanismo de caché de prompts de Claude hace que la parte repetida resulte muy barata. El truco es **mantener una estructura de contexto estable**: pon delante la información de fondo que no cambia y deja al final las preguntas que varían, para aumentar la tasa de aciertos de la caché.

## Resumen

La clave para ahorrar tokens se resume en una frase: **dale al modelo solo lo que realmente necesita**. Limpia el historial a tiempo, excluye archivos irrelevantes, indica los archivos con precisión, elige bien el modelo y divide las tareas grandes. Combinando estas técnicas, mi consumo diario bajó más de la mitad, y los resultados apenas se resintieron.

---

**Lecturas relacionadas**: [Cómo elegir entre Opus 4.8 y Sonnet 4.6](/conduit-blog/es/blog/opus-vs-sonnet/) · [Cómo escribir un CLAUDE.md realmente útil](/conduit-blog/es/blog/claude-md-guide/)
