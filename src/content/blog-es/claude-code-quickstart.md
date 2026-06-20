---
title: "Inicio rápido de Claude Code: de la instalación a tu primera edición de código con IA"
description: "Una guía práctica para instalar y configurar Claude Code, hacer tu primera edición de código con IA y configurar BASE URL / API key, con soluciones a los errores más comunes."
pubDate: 2026-06-19
tags: ["Claude Code", "Tutorial", "Primeros pasos"]
keywords: ["configurar Claude Code", "tutorial de Claude Code", "configuración BASE URL"]
draft: false
---

Para la mayoría de las personas, lo difícil de empezar con Claude Code no es *usarlo*, sino **lograr conectarlo**: dónde va la key, cómo establecer la BASE URL y por qué da error en la primera ejecución. Esta guía recorre todo el flujo para que tengas a la IA editando tu código en unos 5 minutos.

## 1. Instala Claude Code

Claude Code es una herramienta de línea de comandos (CLI). Instalarla es un solo comando:

```bash
npm install -g @anthropic-ai/claude-code
```

Después ejecuta `claude --version`: si ves un número de versión, todo está bien.

## 2. Configura el acceso (el paso clave)

Claude Code necesita dos cosas para funcionar: una **API key** y una **BASE URL**.

La configuración más habitual es mediante variables de entorno:

```bash
export ANTHROPIC_AUTH_TOKEN="tu-key"
export ANTHROPIC_BASE_URL="tu-url-de-endpoint"
```

> Consejo: añade estas dos líneas a `~/.zshrc` o `~/.bashrc` para que se carguen automáticamente en cada terminal nueva.

## 3. Tu primera edición de código con IA

Entra en cualquier directorio de proyecto y ejecuta:

```bash
claude
```

Luego describe lo que quieres en lenguaje natural, por ejemplo:

> "En utils.js, cambia cada `var` por `const` y añade comentarios breves."

Claude Code lee tus archivos, propone los cambios y los escribe de vuelta después de que confirmes. Tu tarea es solo revisar y aprobar.

## 4. Errores comunes

| Síntoma | Causa probable | Solución |
|---|---|---|
| `401 Unauthorized` | Key incorrecta o sin definir | Verifica el valor de la key y que la variable de entorno esté exportada |
| Timeout / sin respuesta | BASE URL incorrecta o problema de red | Verifica la escritura de la URL; sin barra final |
| Modelo no encontrado | Nombre de modelo incorrecto | Usa un nombre de modelo que tu proveedor admita |

## Cierre

Conectarse se reduce realmente a dos cosas: **la key correcta** y **la BASE URL correcta**. Una vez configuradas, Claude Code es un asistente que lee tu código y lo edita bajo demanda. Empieza con cambios pequeños para acostumbrarte al flujo de confirmación y luego encárgale tareas más grandes.

---

Si quieres acceder a Claude (y a GPT, y a más) a través de un único endpoint, **Conduit AI** es una puerta de enlace unificada de API de LLM: una sola BASE URL, pago por uso (~1/8 del precio oficial), sin suscripción. Funciona de inmediato con Claude Code: solo apunta `ANTHROPIC_BASE_URL` hacia él.
