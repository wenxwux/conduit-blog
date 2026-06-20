---
title: "Subagentes de Claude Code: ejecuta tareas en paralelo de principio a fin"
description: "Aprende cómo funcionan los subagentes de Claude Code, cuándo lanzarlos y cómo ejecutar varias tareas de programación en paralelo sin colisiones de contexto ni desperdicio de tokens."
pubDate: 2026-06-19
tags: ["Claude Code", "Subagentes", "Flujo de trabajo"]
keywords: ["subagentes de Claude Code", "tareas en paralelo en Claude Code", "flujo de trabajo con subagentes"]
draft: false
---

La mayor mejora de velocidad que saqué de Claude Code no fue un modelo más rápido, sino aprender a dejar de hacerlo todo en una sola conversación. Los subagentes te permiten delegar fragmentos de trabajo autónomos a agentes separados que se ejecutan con su propia ventana de contexto y luego reportan. Bien hecho, pasas de "vigilar un único hilo largo" a "lanzar cinco tareas y revisar los resultados".

Así es como los uso en la práctica.

## Qué es realmente un subagente

Un subagente es una instancia nueva de Claude Code lanzada por el agente principal. Obtiene su propia ventana de contexto, hace un solo trabajo y devuelve un resumen final, no los volcados brutos de archivos que leyó por el camino. Esa última parte importa: el padre solo conserva la *conclusión*, así que tu conversación principal se mantiene limpia aunque el subagente haya leído 40 archivos para llegar ahí.

Dos propiedades hacen que los subagentes valgan la pena:

- **Aislamiento**: la exploración de un subagente no contamina el contexto de tu hilo principal.
- **Paralelismo**: los subagentes independientes se ejecutan de forma concurrente, así que el tiempo real (de reloj) baja.

## Cuándo lanzar uno (y cuándo no)

Recurre a un subagente cuando:

- La tarea es **intensiva en lectura** —"encuentra todos los sitios donde llamamos a la antigua API de autenticación"— y solo quieres la respuesta, no el rastro de búsqueda.
- Tienes **trabajo independiente** que puede correr en paralelo, p. ej. escribir pruebas para el módulo A *mientras* refactorizas el módulo B.
- Quieres un **rol especializado** —un revisor, un explorador, un arquitecto— con sus propias instrucciones.

No te molestes cuando la tarea es una única edición conocida que podrías hacer en dos llamadas de herramienta. El sobrecoste de poner en marcha un agente no compensa para trabajo trivial.

## Ejecutar tareas en paralelo

La jugada clave: lanza los subagentes independientes **en un solo mensaje**. Si los envías de uno en uno, se encolan. Enviados juntos, corren de forma concurrente.

Un prompt típico que le doy al agente principal:

> "Lanza tres subagentes en paralelo: (1) explora cómo funciona el flujo de pago y reporta la cadena de llamadas, (2) encuentra todos los timeouts codificados a mano en el repositorio, (3) redacta pruebas unitarias para `utils/date.ts`. Reporta cuando los tres terminen."

Cada uno vuelve con un resumen conciso. Reviso y luego decido el siguiente paso. Lo importante: nunca tuve que ver tres búsquedas desfilando por pantalla; obtuve tres conclusiones.

## Darle a los subagentes el rol adecuado

Los subagentes genéricos funcionan, pero los especializados funcionan mejor. En la práctica me apoyo en unos pocos patrones:

| Rol | Bueno para | Qué devuelve |
|---|---|---|
| Explorador | Mapear código desconocido, "dónde está X" | Una respuesta localizada + rutas de archivos clave |
| Arquitecto | Diseñar una funcionalidad antes de programar | Un plan de construcción con archivos a tocar |
| Revisor | Revisar un diff en busca de bugs | Solo problemas de alta confianza |
| Implementador | Un cambio acotado y bien definido | El cambio, probado |

Si tu configuración admite definiciones de agente personalizadas, escribe un breve archivo de instrucciones por rol para no tener que reexplicar el trabajo cada vez. Un agente revisor que siempre "reporta solo problemas de alta confianza" te ahorra tener que vadear nimiedades.

## Un ejemplo real de principio a fin

Supón que estoy añadiendo un sistema de feature flags. Este es el flujo que ejecutaría:

1. **Subagente arquitecto** — "Diseña una capa mínima de feature flags que encaje con nuestro patrón de configuración actual. Devuelve los archivos a crear/modificar y el flujo de datos." Reviso el plano.
2. **Dos subagentes implementadores en paralelo** — uno construye el almacén de flags, el otro conecta el hook de React. No dependen de los *archivos* del otro, solo de la interfaz compartida que definió el arquitecto, así que corren juntos.
3. **Subagente revisor** — una vez que ambos aterrizan, "revisa el diff en busca de bugs y violaciones de convenciones".
4. La prueba de integración final la hago yo mismo.

Lo que antes era una tarde larga y de un solo hilo se convierte en unas pocas ráfagas en paralelo conmigo como editor jefe.

## Cosas que pillan a la gente

- **Archivos compartidos = serialízalos.** Si dos subagentes editan el mismo archivo, ejecútalos de forma secuencial o tendrás conflictos. El paralelismo solo ayuda cuando el trabajo es genuinamente independiente.
- **Sé específico en la delegación.** Un subagente no puede hacerte una pregunta aclaratoria a mitad de tarea como sí puede el hilo principal. Los prompts vagos producen resúmenes vagos. Detalla el entregable.
- **No vuelvas a ejecutar una búsqueda que delegaste.** Una vez que entregas una consulta a un subagente, espérala; ejecutarla tú también solo duplica el gasto de tokens.
- **Vigila el uso de tokens.** Muchos agentes en paralelo sobre un repositorio grande queman tokens rápido. Si enrutas a través de una puerta de enlace unificada con facturación de pago por uso, esto es fácil de vigilar; eso sí, no despliegues cinco agentes para una corrección de una línea.

## Cierre

Los subagentes cambian cómo *piensas* una tarea: en lugar de una conversación larga, descompones el trabajo en unidades aisladas y paralelizables y te conviertes en el revisor. Empieza pequeño: delega una búsqueda intensiva en lectura y observa cuánto más limpio se mantiene tu hilo principal. Luego prueba dos implementadores en paralelo sobre archivos independientes. Una vez que te haga clic, no volverás atrás.

Lecturas relacionadas: [Inicio rápido de Claude Code](/conduit-blog/es/blog/claude-code-quickstart/)
