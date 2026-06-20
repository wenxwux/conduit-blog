---
title: "Trucos de ingeniería para reducir los costes de la API de LLM: caché, batching y elección de modelo"
description: "Tácticas concretas de ingeniería para bajar tu factura de la API de LLM: caché de prompts, batching de peticiones, enrutamiento inteligente de modelos y reducción de prompts, con patrones reales de antes/después."
pubDate: 2026-06-19
tags: ["LLM", "Optimización de costes", "API"]
keywords: ["reducir costes de la API de LLM", "caché de prompts", "batching de LLM", "enrutamiento de modelos"]
draft: false
---

Cuando una funcionalidad con LLM pasa de prototipo a producción, la factura deja de ser un error de redondeo. La buena noticia: la mayor parte del gasto es desperdicio que puedes eliminar mediante ingeniería sin tocar la calidad. Estas son las cuatro palancas a las que recurro, en el orden en que recurro a ellas, porque dan el mayor ahorro con el menor esfuerzo.

## 1. Caché de prompts: deja de pagar por los mismos tokens

La mayoría de los prompts de producción tienen un prefijo grande y estable —un system prompt, definiciones de herramientas, ejemplos few-shot, un trozo de contexto recuperado— seguido de una pequeña parte variable (la pregunta real del usuario). Sin caché, pagas el precio de entrada completo de todo ese prefijo en cada llamada.

La caché de prompts permite al proveedor almacenar el prefijo y cobrar una fracción por los aciertos de caché. El patrón:

- Pon **todo lo estable al principio**: instrucciones del sistema, esquema, ejemplos.
- Pon la **entrada variable del usuario al final**.
- Marca el límite para que el prefijo sea cacheable.

```python
messages = [
    # --- prefijo cacheable: idéntico en todas las peticiones ---
    {"role": "system", "content": LONG_SYSTEM_PROMPT},   # 2k tokens
    {"role": "system", "content": TOOL_DEFINITIONS},      # 1k tokens
    {"role": "system", "content": FEW_SHOT_EXAMPLES},     # 3k tokens
    # --- sufijo variable: cambia en cada llamada ---
    {"role": "user", "content": user_question},           # 100 tokens
]
```

Si sirves el mismo agente a muchos usuarios, ese prefijo de 6k tokens es el grueso de tu coste de entrada, y cachearlo es el cambio de mayor apalancamiento que puedes hacer. La pega: las cachés expiran, así que cachear solo rinde cuando las llamadas llegan próximas en el tiempo. El tráfico en ráfagas y de alto volumen se beneficia más; una llamada por hora, menos.

## 2. Batching: cambia latencia por rendimiento

Si tu trabajo no es sensible a la latencia —resumen nocturno, clasificación masiva, embedding de un backlog— no dispares las peticiones de una en una a precios de tiempo real. Las API de batch procesan muchas peticiones de forma asíncrona con un fuerte descuento.

Regla práctica sobre qué agrupar (batch):

- **Agrupa:** trabajos en segundo plano, pipelines de datos, evaluaciones, colas de generación de contenido, cualquier cosa donde "hecho en unas horas" esté bien.
- **No agrupes:** chat, cualquier cosa por la que un usuario esté esperando.

Incluso sin una API de batch dedicada, puedes agrupar el trabajo: en lugar de una llamada a la API por elemento, pídele al modelo que maneje varios elementos en una sola llamada.

```python
# En lugar de 50 llamadas...
for item in items:
    classify(item)

# ...una llamada que clasifica 50 elementos
classify_batch(items)   # devuelve un array JSON de 50 etiquetas
```

Esto recorta el sobrecoste por llamada y permite amortizar el prefijo cacheable entre más salida útil. Vigila el límite de tokens de salida y mantén tamaños de batch razonables para que una sola respuesta malformada no te cueste el batch entero.

## 3. Enrutamiento de modelos: no envíes todo al modelo grande

El sobregasto más común que veo: enrutar *cada* petición al modelo más capaz (y más caro). La mayoría de las peticiones no lo necesitan.

Estratifica tu tráfico:

| Tarea | Nivel de modelo | Por qué |
|---|---|---|
| Clasificación, extracción, enrutamiento | Pequeño/barato | Determinista, fácil, alto volumen |
| Borradores, resúmenes, preguntas simples | Medio | Suficientemente bueno, mucho más barato |
| Razonamiento difícil, arquitectura de código, tareas ambiguas | Grande | Aquí vale la pena el precio |

Un router sencillo da mucho de sí:

```python
def pick_model(task):
    if task.type in ("classify", "extract", "route"):
        return "small-model"
    if task.needs_deep_reasoning:
        return "large-model"
    return "mid-model"
```

También puedes **encadenar (cascade)**: prueba primero el modelo barato y escala al caro solo cuando una comprobación de confianza o una validación falle. Para una carga de trabajo donde el 80 % de las peticiones son fáciles, esto por sí solo puede recortar la factura drásticamente. Enrutar a través de una única puerta de enlace lo hace trivial: cambias una cadena con el nombre del modelo, no un SDK ni un endpoint.

## 4. Adelgaza el propio prompt

Cada token de entrada, cada token de salida, es dinero. Objetivos rápidos de auditoría:

- **System prompts inflados**: recorta instrucciones repetidas y ejemplos muertos. Más corto a menudo rinde *mejor*, no peor.
- **Contexto RAG sobrecargado**: recupera menos fragmentos y más relevantes, en lugar de volcar diez documentos. Reordena y recorta.
- **Salida sin tope**: fija `max_tokens` a lo que realmente necesites. Un resumidor no necesita 4k tokens de margen.
- **Formatos verbosos**: pide JSON compacto, no explicaciones envueltas en prosa que vas a desechar.

## Juntándolo todo

Apila las palancas: se acumulan.

1. **Cachea** el prefijo estable (la mayor victoria individual para prompts repetidos).
2. **Agrupa (batch)** todo lo que no sea de cara al usuario.
3. **Enruta** las tareas fáciles a modelos baratos, escala solo cuando haga falta.
4. **Recorta** prompts y limita las salidas para no pagar por relleno.

En la práctica empiezo por la caché y el enrutamiento porque son los de mayor apalancamiento con el menor riesgo, y luego añado el batching para los trabajos en segundo plano. Nada de esto degrada la calidad: solo te impide pagar el precio completo de tiempo real por trabajo que no lo necesita. El token más barato es el que nunca envías.

Lecturas relacionadas: [La misma tarea, 5 modelos: cuál ofrece la mejor relación calidad-precio](/conduit-blog/es/blog/best-value-model/)
