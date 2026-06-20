---
title: "Conectar Claude Code sin tropiezos: errores comunes al configurar BASE URL / key"
description: "Al conectar Claude Code, lo que más atasca es la configuración de la BASE URL y la key. Este artículo resume los errores más frecuentes, sus causas y soluciones; siguiéndolo, casi siempre se resuelve."
pubDate: 2026-06-19
tags: ["Claude Code", "Conexión", "Solución de errores"]
keywords: ["errores de Claude Code", "configuración BASE URL", "configuración de key de Claude Code"]
draft: false
---

Una vez instalado Claude Code, lo que de verdad atasca a la gente no suele ser cómo usarlo, sino la **conexión**: dónde poner la key, cómo configurar la BASE URL y por qué da error en cuanto se ejecuta. Este artículo reúne los problemas con los que más me he topado y que más me han preguntado; siguiéndolo paso a paso, casi todo se resuelve.

## 1. Primero, ten claro qué hace falta para conectarse

Claude Code solo necesita dos cosas para funcionar:

- **Una API key** (la credencial de identidad)
- **Una BASE URL** (a dónde se envían las peticiones)

La forma más habitual es escribirlas en variables de entorno:

```bash
export ANTHROPIC_AUTH_TOKEN="tu-key"
export ANTHROPIC_BASE_URL="tu-url-de-conexión"
```

> Te recomiendo escribir estas dos líneas en `~/.zshrc` o `~/.bashrc`, ejecutar luego `source ~/.zshrc` para que surtan efecto y así se carguen automáticamente cada vez que abras una terminal, sin tener que exportarlas a mano cada vez.

## 2. Repaso de los errores comunes

### 1. `401 Unauthorized` (fallo de autenticación)

El más frecuente. Casi siempre es un problema de la key:

- Al copiar la key quedó un espacio o un salto de línea de más → vuelve a copiarla de forma limpia
- El nombre de la variable de entorno está mal escrito → confirma que sea `ANTHROPIC_AUTH_TOKEN`
- Cambiaste la variable pero no surtió efecto → reabre la terminal o haz un `source`
- Verifica si realmente se está leyendo:

```bash
echo $ANTHROPIC_AUTH_TOKEN
```

Si la salida está vacía, significa que no quedó configurada.

### 2. Timeout de conexión / sin respuesta

Suele ser un problema de la BASE URL:

- La dirección está mal escrita → revísala carácter por carácter
- **Una barra de más al final** → este es un fallo muy frecuente; prueba a quitar el `/` del final de `https://xxx.com/`
- El protocolo se escribió como `http` → normalmente hay que usar `https`
- Verifica el valor actual:

```bash
echo $ANTHROPIC_BASE_URL
```

### 3. `404 Not Found`

Lo más probable es que la ruta de la BASE URL sea incorrecta. Ten en cuenta que la BASE URL normalmente **solo llega hasta la raíz del dominio** (o hasta `/v1`, según las indicaciones de tu proveedor); no escribas también la ruta completa de la interfaz, ya que Claude Code completará el resto automáticamente.

### 4. Modelo inexistente / `model not found`

El nombre de modelo que indicaste no está admitido por el proveedor o está mal escrito. Solución:

- Usa un nombre de modelo estándar admitido por el proveedor
- En Claude Code usa `/model` para ver las opciones disponibles
- Comprueba que no haya errores tipográficos (por ejemplo, un número de versión mal escrito)

### 5. Cambiaste la configuración pero no surte efecto

Este problema es tan común que merece punto aparte:

- Tras cambiar una variable de entorno **es obligatorio reabrir la terminal o hacer source** para que la sesión actual se actualice
- Si la configuraste en varios sitios a la vez (variables de entorno, archivos de configuración), pueden sobrescribirse entre sí; deja una sola
- Si la cosa se complica de verdad, limpia las variables con `unset` y vuelve a configurarlas:

```bash
unset ANTHROPIC_AUTH_TOKEN
unset ANTHROPIC_BASE_URL
```

Y luego vuelve a hacer export.

## 3. Una tabla rápida de diagnóstico

| Síntoma del error | Causa más probable | Solución |
|---|---|---|
| 401 Unauthorized | key incorrecta / no surte efecto | Reescribe la key, revisa la variable de entorno |
| Timeout de conexión | BASE URL incorrecta / barra de más | Revisa la dirección, quita la barra final |
| 404 Not Found | ruta de más | La BASE URL solo hasta la raíz o /v1 |
| model not found | nombre de modelo incorrecto | Usa un nombre admitido, consulta con `/model` |
| cambié algo y no reacciona | no se recargó la variable de entorno | Reabre la terminal o haz source |

## 4. Un orden de diagnóstico infalible

Ante cualquier error de conexión, sigo siempre este orden, y nunca falla:

1. `echo` para confirmar que la key y la BASE URL **se están leyendo de verdad**
2. Revisa si la BASE URL **tiene una barra de más al final** y si el protocolo es correcto
3. **Reabre la terminal** para descartar que la variable de entorno no haya surtido efecto
4. Prueba con la instrucción más básica posible para acotar el problema

## Resumen

La esencia de la conexión son solo dos cosas: **poner la key correcta y configurar bien la BASE URL**. El noventa por ciento de los errores no escapa de estas dos categorías: "la key no surtió efecto" y "la BASE URL está mal escrita". Recuerda: primero verifica con `echo`, luego revisa las barras y, por último, reabre la terminal; casi siempre podrás resolverlo por tu cuenta. Una vez configurado, Claude Code es un gran asistente que lee tu código y lo modifica automáticamente según tus instrucciones.

---

**Lecturas relacionadas**: [7 técnicas prácticas para ahorrar tokens en Claude Code](/conduit-blog/es/blog/claude-code-save-tokens/) · [Cómo escribir un CLAUDE.md realmente útil](/conduit-blog/es/blog/claude-md-guide/)
