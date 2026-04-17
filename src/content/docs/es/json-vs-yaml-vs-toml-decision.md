---
title: "JSON vs YAML vs TOML — Un marco práctico de decisión"
description: "Deja de discutir sobre formatos de configuración. Un marco práctico para elegir entre JSON, YAML y TOML según quién lo lee, quién lo edita y qué tooling tienes."
category: formats
relatedToolIds: ["yaml-to-json", "json-to-yaml", "json-to-toml", "toml-to-json"]
publishedAt: 2026-04-17
lang: es
tags: ["yaml", "toml", "formats", "config"]
excerpt: "JSON, YAML y TOML representan el mismo árbol de datos. Cuál usar lo decide quién edita el archivo, no el gusto sintáctico."
---

JSON, YAML y TOML pueden representar el mismo árbol de datos. Un manifest de Kubernetes en YAML, un `package.json` en JSON y un `pyproject.toml` en TOML están codificando las mismas ideas estructurales: maps anidados, listas, escalares. Cuál usar lo decide menos el gusto sintáctico y más **quién edita el archivo, quién lo lee y qué tooling tienes al otro lado**.

Esta guía te da un marco práctico para esa decisión, los pitfalls de cada formato y las rutas de conversión entre ellos.

## Los tres formatos en una tabla

| Propiedad | JSON | YAML | TOML |
| --- | --- | --- | --- |
| Primera spec | 2001 (RFC 4627, actualizada 8259) | 2001 (v1.2.2 última, 2021) | 2013 (v1.0.0 en 2021) |
| Público objetivo | Máquinas | Humanos | Humanos (solo config) |
| Comentarios | **No** | `#` | `#` |
| Comas finales | No | N/A | No |
| Strings necesitan comillas | Sí | No (a menudo) | Sí |
| Múltiples documentos | No | Sí (separador `---`) | No |
| Referencias complejas | No | Sí (anchors `&`/`*`) | No |
| Historia de schema | JSON Schema (maduro) | JSON Schema vía conversión | TOML no tiene schema nativo |
| Complejidad del parser | Baja | **Muy alta** | Media |
| Tamaños típicos de archivo | Cualquiera | Cualquiera, pero degrada pasadas ~1k líneas | Solo config pequeña-media |

## JSON: formato de cable, no de configuración

JSON se diseñó como formato de intercambio de datos y se nota. Sin comentarios, sin comas finales, comillas obligatorias en cada string y clave. Son features para tráfico máquina-a-máquina y propiedades activamente hostiles para configuración editada por humanos.

Tira de JSON cuando:

- Los datos se mueven por red o entre procesos.
- Necesitas el parser más soportado del planeta.
- Generas el archivo desde código, no lo editas a mano.
- Necesitas validación JSON Schema con un stack maduro.

Evita JSON cuando los humanos van a editar el archivo con frecuencia. Herramientas como [JSON a YAML](/es/json-to-yaml) existen porque los archivos de configuración `.json` en proyectos reales se acaban reescribiendo como YAML al cabo de un año.

```json
{
  "name": "api-gateway",
  "port": 8080,
  "database": {
    "host": "localhost",
    "poolSize": 20
  },
  "featureFlags": ["rate-limit", "audit-log"]
}
```

Limpio. Amigable para máquinas. Sin comentarios que expliquen *por qué* `poolSize` es 20.

## YAML: superset de JSON, con colmillos

YAML 1.2 es técnicamente un superset de JSON — todo documento JSON válido parsea como YAML. Añade comentarios, múltiples documentos, anchors y aliases, múltiples estilos de escalar y whitespace significativo. Por eso Kubernetes, GitHub Actions, Ansible y muchos CI lo eligieron.

```yaml
# api-gateway config
name: api-gateway
port: 8080

database:
  host: localhost
  poolSize: 20   # subido desde 10 tras el incidente de diciembre

featureFlags:
  - rate-limit
  - audit-log

# reutilizado entre targets de deploy
defaults: &defaults
  timeout: 30s
  retries: 3

production:
  <<: *defaults
  replicas: 5

staging:
  <<: *defaults
  replicas: 1
```

Los anchors (`&defaults`, `*defaults`, merge key `<<:`) son genuinamente útiles para DRY en configuración. Son también lo primero con lo que tropieza un novato de YAML.

YAML tiene footguns de seguridad reales:

- **Deserialización basada en tags.** Tags `!!python/object:...`, `!!java...`, `!!ruby/object:...` permiten que un YAML malicioso instancie clases arbitrarias durante el parseo. **Usa siempre `yaml.safe_load()` en Python, `SafeConstructor` en snakeyaml, `YAML(typ='safe')` en ruamel.** Nunca llames `yaml.load()` sobre input no confiable.
- **El problema de Noruega.** El `NO` sin comillas se parseaba históricamente como booleano `false` en YAML 1.1. YAML 1.2 lo acotó pero muchos parsers siguen semántica 1.1. Si escribes códigos de país sin comillas, tienes un bug esperando.
- **Whitespace significativo.** Tabs y espacios no son intercambiables. Un tab perdido y tu config se reestructura silenciosamente.

Usa YAML cuando el archivo lo editan humanos principalmente, las referencias son útiles (config multi-environment), y tienes un validador de schema al otro lado. Pásalo por [YAML a JSON](/es/yaml-to-json) para comprobar qué ve tu parser realmente.

## TOML: config para humanos, sin la cuerda

TOML se diseñó explícitamente para archivos de configuración por Tom Preston-Werner. Es deliberadamente menos expresivo que YAML y cambia esa expresividad por cero ambigüedad. Cargo de Rust (`Cargo.toml`) y el packaging moderno de Python (`pyproject.toml`) lo eligieron.

```toml
# api-gateway config
name = "api-gateway"
port = 8080

[database]
host = "localhost"
pool_size = 20  # subido desde 10 tras el incidente de diciembre

feature_flags = ["rate-limit", "audit-log"]

[production]
replicas = 5
timeout = "30s"
retries = 3

[staging]
replicas = 1
timeout = "30s"
retries = 3
```

TOML brilla en configs planas o con anidamiento moderado. Tiene soporte nativo para fechas (`RFC 3339`), enteros, floats, booleanos y strings, con tipos explícitos que no adivinan. No existe el problema de Noruega porque los strings requieren comillas.

Donde TOML se rompe es en datos profundamente anidados. Representar un objeto anidado a 5 niveles funciona pero se lee mal. TOML tampoco tiene mecanismo nativo de referencia o herencia, así que acabas repitiéndote o post-procesando al cargar.

Usa TOML cuando el archivo es una configuración plana o superficial, los humanos son los editores principales, y valoras la explicitud por encima de la expresividad.

## El marco de decisión

Haz tres preguntas en orden:

1. **¿Quién escribe este archivo — una máquina o un humano?** Máquina → JSON. Humano → sigue.
2. **¿Qué profundidad de anidamiento tiene, y necesitas referencias cruzadas?** Profundo + referencias (piensa Kubernetes, Ansible) → YAML. Superficial, sin referencias → TOML.
3. **¿Puede el archivo venir de una fuente no confiable?** Si la respuesta es sí, y elegiste YAML, asegúrate de que todo parser en tu stack está en modo safe-load. JSON y TOML no tienen footguns de deserialización-a-código en su spec.

## Conversión entre ellos

La config tiende a derivar entre formatos durante la vida de un proyecto. Un servicio Node empieza con `package.json`, le crece CI en `.github/workflows/*.yml`, y adopta una tool que quiere `pyproject.toml`. Mantenerlos consistentes es más fácil que elegir uno y forzarlo en todas partes.

JSONCraft trae cuatro conversiones de un paso: [JSON → YAML](/es/json-to-yaml), [YAML → JSON](/es/yaml-to-json), [JSON → TOML](/es/json-to-toml) y [TOML → JSON](/es/toml-to-json). Corren enteramente en tu navegador — los datos no salen de la página, lo cual importa si el archivo tiene secretos.

Algunos caveats sobre la conversión:

- **YAML → JSON pierde comentarios y anchors.** Los anchors se expanden inline, lo que infla el archivo. Los comentarios simplemente desaparecen. Plánealo si el YAML es fuente de verdad que los humanos mantienen.
- **JSON → YAML es lossless en estructura pero tu herramienta puede emitir block style o flow style por defecto.** Revisa la salida.
- **TOML ↔ JSON es el round trip más limpio** porque TOML tiene tipos explícitos que mapean 1:1 a primitivos JSON, con un pero: los tipos date de TOML se convierten en strings en JSON.

## Una regla rápida

- Tráfico de cable, archivos generados por máquina, validación JSON Schema → **JSON**.
- Kubernetes, pipelines CI, configs multi-environment con referencias → **YAML** (con loaders seguros).
- Rust, packaging Python, config de app pequeña-media → **TOML**.

Si te descubres eligiendo YAML para algo pequeño y plano, prueba TOML primero. Si te descubres eligiendo JSON para un archivo que los humanos editan cada semana, prueba YAML. Si estás eligiendo TOML para un árbol profundamente anidado, vas a pasarlo mal.

Ver también: [Pitfalls de seguridad en JSON](/es/docs/json-security-pitfalls/) para ataques a nivel de parser que aplican a inputs JSON aunque el formato parezca benigno.
