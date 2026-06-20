---
title: "La misma tarea, 5 modelos: cuál ofrece la mejor relación calidad-precio"
description: "Ejecuté las mismas tareas de programación y redacción en cinco LLM para comparar calidad, velocidad y coste. Aquí tienes cómo pensar en valor por dólar en lugar de en benchmarks brutos."
pubDate: 2026-06-19
tags: ["LLM", "Comparación de modelos", "Coste"]
keywords: ["LLM con mejor relación calidad-precio", "comparación de modelos", "coste vs calidad de LLM", "qué modelo usar"]
draft: false
---

"¿Qué modelo es el mejor?" es la pregunta equivocada. La correcta es "el de mejor valor *para esta tarea*", porque el modelo más capaz es excesivo para la mitad de lo que en realidad le pedimos, y el más barato falla silenciosamente en la otra mitad. Así que, en lugar de fiarme de los rankings, ejecuté el mismo conjunto de tareas en cinco modelos y observé calidad, velocidad y coste en conjunto. Aquí tienes el marco de trabajo y lo que descubrí.

## El planteamiento

Usé un conjunto fijo de tareas que refleja el trabajo real, no trivialidades de benchmark:

- **Código:** implementar una pequeña funcionalidad a partir de una especificación, y corregir un bug a partir de un stack trace.
- **Refactorización:** limpiar un archivo desordenado de 200 líneas.
- **Razonamiento:** un problema de lógica de varios pasos con una respuesta verificable.
- **Redacción:** reescribir un párrafo denso para hacerlo más claro.
- **Extracción:** extraer JSON estructurado de un texto sin estructura.

Cada tarea se ejecutó en cinco modelos que abarcan un nivel insignia, un nivel medio y un nivel pequeño/económico. Puntué la calidad de la salida del 1 al 5 a mano, cronometré las respuestas y registré el coste en tokens. A propósito no publico las cifras exactas por modelo —cambian constantemente y dependen de tus prompts—, pero los *patrones* son estables, y eso es lo útil.

## Qué significa realmente "valor"

La métrica es el valor por dólar, no la calidad bruta:

```
valor = puntuación_de_calidad / coste_de_la_tarea
```

Un modelo insignia que puntúa 5/5 a un coste 8× superior al de un modelo medio que puntúa 4,5/5 ofrece *peor valor* para la mayoría de las tareas. Estás pagando un gran sobreprecio por el último medio punto, que solo importa cuando ese medio punto marca la diferencia entre lanzar o no lanzar.

## Los patrones que se mantuvieron

**1. En tareas fáciles y estructuradas, los niveles convergen.**
La extracción y la clasificación se vieron casi idénticas en los cinco modelos: hasta el más barato produjo un JSON limpio y correcto. Aquí, pagar por el insignia es puro desperdicio. El modelo pequeño es el ganador en relación calidad-precio por mucho.

**2. En razonamiento difícil, la brecha es real.**
El problema de lógica de varios pasos y la corrección del bug más complicado separaron al grupo. El insignia y los modelos medios potentes lo lograron; los baratos produjeron con confianza respuestas erróneas. Aquí es exactamente donde el sobreprecio se justifica: una respuesta equivocada que *parece* correcta es la salida más cara que existe.

**3. La gama media es la campeona silenciosa del valor.**
En redacción de borradores, refactorización y programación estándar, un buen modelo de gama media alcanzó ~90 % de la calidad del insignia a una fracción del precio. Para el grueso del trabajo del día a día, este es el punto óptimo. Yo me quedo aquí por defecto y solo escalo cuando me topo con algo genuinamente difícil.

**4. La velocidad importa más de lo que esperaba.**
Para programación interactiva, un modelo de calidad ligeramente inferior pero notablemente más rápido a menudo se sentía *mejor* para trabajar: bucle de retroalimentación más ajustado, más iteraciones por minuto. La latencia es parte del valor cuando hay un humano en el bucle.

## Una tabla de decisión que de verdad uso

| Tarea | Mejor opción por valor | Razonamiento |
|---|---|---|
| Clasificar / extraer / enrutar | Pequeño/barato | La calidad converge; domina el coste |
| Borradores, resúmenes, código estándar | Medio | ~90 % de calidad, gran ahorro de coste |
| Refactorizar un archivo conocido | Medio | Bastante mecánico; ahórrate el sobreprecio |
| Bug difícil / diseño ambiguo | Insignia | Aquí el medio punto vale la pena |
| Programación en pareja interactiva | Medio rápido | La velocidad del bucle supera la calidad marginal |

## Cómo hacer tu propia prueba (no te fíes de la mía)

Los modelos cambian cada mes; la única comparación que importa es con *tus* prompts. Haz esto:

1. Elige entre 5 y 10 tareas que representen tu carga de trabajo real.
2. Escribe el prompt una vez y ejecútalo sin cambios en los modelos candidatos.
3. Puntúa la calidad a ciegas (oculta qué modelo produjo qué).
4. Registra el coste y la latencia por tarea.
5. Calcula `calidad / coste` y míralo por tipo de tarea, no en conjunto.

El obstáculo práctico suele ser la "fontanería": distintos SDK, keys y endpoints por proveedor convierten las pruebas A/B en un fastidio. Yo paso los cinco por una única puerta de enlace con un solo endpoint, de modo que cambiar de modelo es cambiar una cadena de texto en la petición. Eso convierte "qué modelo ofrece mejor valor" de un proyecto de investigación en un experimento de cinco minutos que puedes repetir cada vez que salga un nuevo modelo.

## La conclusión

No hay un único mejor modelo, sino un mejor *encaje* por tarea. El error caro no es elegir el insignia equivocado; es enviar trabajo fácil y de alto volumen a un insignia, simplemente. Usa por defecto un buen modelo de gama media, baja al barato para tareas estructuradas y escala al insignia solo para el razonamiento difícil que justifica el sobreprecio. Mide el valor por dólar en tus propias tareas y vuelve a medirlo cuando cambien los modelos, porque cambiarán.

Lecturas relacionadas: [Trucos de ingeniería para reducir los costes de la API de LLM](/conduit-blog/es/blog/cut-llm-api-costs/)
