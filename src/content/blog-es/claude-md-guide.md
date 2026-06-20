---
title: "Cómo escribir un CLAUDE.md realmente útil (con plantilla)"
description: "Un CLAUDE.md bien escrito evita que Claude Code dé rodeos y haga preguntas inútiles. Este artículo explica con claridad qué debe y qué no debe ir en CLAUDE.md, e incluye una plantilla lista para copiar."
pubDate: 2026-06-19
tags: ["Claude Code", "CLAUDE.md", "Tutorial de IA"]
keywords: ["cómo escribir CLAUDE.md", "plantilla CLAUDE.md", "configuración de Claude Code"]
draft: false
---

Cuando empecé a usar Claude Code, siempre me parecía que "no entendía nada": cada vez tenía que volver a decirle qué gestor de paquetes usar, cómo correr las pruebas, cuál era el estilo de código. Más tarde descubrí que todo esto se puede escribir una sola vez en `CLAUDE.md`: lo lee automáticamente y, a partir de ahí, todo queda sobreentendido. Este artículo explica con claridad cómo escribir ese archivo.

## 1. Qué es CLAUDE.md

`CLAUDE.md` se coloca en la raíz del proyecto y es el "manual del proyecto" que Claude Code carga automáticamente al iniciarse. Lo que escribas en él actúa como contexto de largo plazo e influye en cada una de sus respuestas posteriores.

Dicho de forma sencilla, es el "acuerdo" entre tú y la IA. Cuanto más claro esté escrito el acuerdo, menos errores básicos cometerá y menos tendrás que corregirlo una y otra vez.

## 2. Qué debe ir (contenido de alto valor)

La experiencia dice: **pon solo aquello que "debe saber para no equivocarse"**, y no traslades aquí toda la documentación del proyecto. Yo pongo estas categorías:

### 1. Stack tecnológico y herramientas

```
- Lenguaje: TypeScript (modo estricto)
- Gestor de paquetes: pnpm (no usar npm / yarn)
- Framework: Next.js 14 App Router
- Pruebas: vitest, ejecutar `pnpm test`
```

### 2. Convenciones de estructura del proyecto

```
- Los componentes de negocio van en src/components/
- Las funciones de utilidad van en src/lib/
- No escribir peticiones de datos directamente en components; pasar siempre por src/api/
```

### 3. Estilo de código y líneas rojas

```
- Usar componentes funcionales + hooks, no escribir componentes de clase
- No introducir nuevas dependencias de terceros, preguntarme primero
- Antes de hacer commit es obligatorio correr lint: `pnpm lint`
```

### 4. Comandos de uso frecuente

```
- Iniciar desarrollo: pnpm dev
- Compilar: pnpm build
- Migración de base de datos: pnpm db:migrate
```

## 3. Qué no debe ir (errores comunes)

- ❌ **Grandes bloques de documentación de negocio**: eso va en el README o el wiki; meterlo aquí solo desperdicia contexto.
- ❌ **Detalles que cambian con frecuencia**: lo que escribes hay que mantenerlo, y una indicación desactualizada es peor que ninguna.
- ❌ **Claves, tokens**: nunca los escribas en ningún archivo que vaya a entrar al control de versiones.
- ❌ **Palabrería ajena al código**: cada línea consume tokens; ser conciso es una virtud.

## 4. Plantilla lista para copiar

```markdown
# Descripción del proyecto (CLAUDE.md)

## Stack tecnológico
- Lenguaje:
- Gestor de paquetes:
- Framework:
- Pruebas:

## Estructura del proyecto
-

## Estilo de código
-

## Líneas rojas (de cumplimiento obligatorio)
- No introducir nuevas dependencias por cuenta propia
- Explicar el plan antes de hacer cambios
- Antes de hacer commit, correr:

## Comandos de uso frecuente
- Desarrollo:
- Compilar:
- Pruebas:
```

Rellena los huecos, colócalo en la raíz del proyecto y básicamente ya está listo para usar.

## 5. Mantenlo, no dejes que se pudra

CLAUDE.md no se escribe una vez y ya está. Si cambia el stack o los comandos, recuerda actualizarlo en consecuencia. Mi costumbre es: cada vez que descubro que vuelvo a corregir a la IA el mismo problema, añado esa regla a CLAUDE.md; así el problema se corrige una sola vez y luego surte efecto automáticamente.

## Resumen

Un buen CLAUDE.md no es largo, pero ahorra mucha cháchara de explicaciones repetidas y hace que la salida de la IA se ajuste mejor a las normas de tu proyecto. El principio son solo tres puntos: **escribir solo los acuerdos clave, mantenerlo conciso y actualizarlo de forma continua**. Combinado con la reducción del contexto, funciona aún mejor.

---

**Lecturas relacionadas**: [7 técnicas prácticas para ahorrar tokens en Claude Code](/conduit-blog/es/blog/claude-code-save-tokens/)
