---
title: "Gemini + Google Threat Intelligece: cómo la IA consulta amenazas automáticamente"
slug: gemini-google-threat-intelligece-como-la-ia-consulta-amenazas-automaticamente
wp_url: https://lumacloud.co/gemini-google-threat-intelligece-como-la-ia-consulta-amenazas-automaticamente/
date: 2025-10-14T19:52:12
modified: 2026-03-04T16:02:56
featured_image: https://lumacloud.co/wp-content/uploads/2025/10/29.jpg
---

Imagina que tu SOC detecta una URL sospechosa: **¿qué tan rápido puedes saber si es phishing, ¿quién la creó o qué campaña la respalda? **En el ritmo actual, cada segunda cuenta. Con la combinación de Gemini + función calling con Google Threat Intelligence (GTI), esa información contextual puede llegar automáticamente, sin que un analista tenga que detenerse.

Antes, los equipos de seguridad debían saltar entre herramientas: una para reputación de dominio, otra para historial de malware, otra para campañas asociadas. Todo manual, lento y fragmentado. En cambio, la integración Gemini + GTI busca unir inteligencia y acción: Gemini identifica cuándo necesita datos externos y “llama” a GTI para traer contexto preciso al instante.

Google lo describe así: “GTI function calling expande Gemini al recuperar información contextual de recursos externos como URLs, IPs o dominios sospechosos”. Además, con Code Interpreter, Gemini puede ejecutar scripts para decodificar cadenas ofuscadas antes de hacer la consulta a GTI.

Tabla de contenidos

[Toggle](#)

- Qué es “function calling” con Gemini + Google Threat Intelligece
- Beneficios clave de Gemini + Google Threat Intelligece
- Ejemplos aplicables donde Gemini + Google Threat Intelligece entran en acción
- Desafíos y consideraciones de Gemini + Google Threat Intelligece

- Visión futura de Gemini + Google Threat Intelligece

#### Qué es “function calling” con Gemini + Google Threat Intelligece

Function calling es cuando un modelo (Gemini) decide llamar funciones externas basadas en su análisis interno. En este caso, al ver una URL sospechosa, invoca funciones definidas que consultan GTI. (Ver documentación de Gemini API).

En esta integración, Gemini detecta la necesidad de contexto (ej. dominio no público, IP desconocida) y envía parámetros (URL, dominio, hash) a GTI, que responde con datos como reputación, campañas previas, actores vinculados.

Gemini recibe esos datos y los incorpora al análisis de forma inmediata, enriqueciendo la alerta o sugerencia sin intervención humana.

#### Beneficios clave de Gemini + Google Threat Intelligece

**Respuestas más rápidas:** el analista no tiene que pausar su flujo para buscar contexto.

**Menos errores:** elimina omisiones en el análisis de amenazas.

**Contexto valioso desde el inicio**: saber quién atacó, con qué herramientas, cuál es el riesgo.

**Automatización del enriquecimiento:**Gemini + GTI llenan la ficha de análisis sin esfuerzo humano.

**Eficiencia operativa:** los equipos pueden priorizar mejor y actuar con mayor foco.

#### Ejemplos aplicables donde Gemini + Google Threat Intelligece entran en acción

**Phishing:** Una URL oculta con typo (“[micorreo-msj.com](http://micorreo-msj.com/)”) es detectada. Gemini llama a GTI antes de que un usuario caiga, permitiendo bloqueo automático.

**Delito de malware con código ofuscado**: un archivo ejecutable tiene cadenas codificadas. Gemini, con su Code Interpreter, decodifica y luego llama a GTI para consultar hash y campañas asociadas, entregando un contexto completo al SOC.

**Conexión a dominio malicioso desde endpoint interno:** Gemini intercepta la comunicación, invoca GTI, recibe que el dominio pertenece a operación de comando y control (C2) usada en campañas APT, y envía alerta priorizada con toda la evidencia al equipo de respuesta.

#### Desafíos y consideraciones de Gemini + Google Threat Intelligece

Privacidad y permisos de acceso: las llamadas a GTI deben respetar políticas de datos y límites de acceso.

Transparencia: el modelo debe exponer por qué hizo esa llamada (qué parámetros envió).

Cobertura de datos: GTI debe tener suficiente inteligencia histórica para que la consulta sea útil.

Depender demasiado de la IA: si la integración falla, los analistas deben tener rutas manuales robustas.

### Visión futura de Gemini + Google Threat Intelligece

Esta integración posiciona a Gemini + GTI como un asistente autónomo para investigaciones. En el futuro, podríamos ver que Gemini no solo llame funciones, sino también ejecute mitigaciones automáticas (aislar hosts, bloquear dominios) bajo supervisión humana.

Existen señales de que este enfoque evoluciona rápidamente: Google ya ha integrado Gemini en Threat Intelligence para análisis de malware, consultas conversacionales y enriquecimiento automático. Además, la versión experimental Sec-Gemini v1 busca combinar Gemini con datos de seguridad en tiempo real para casos de análisis de amenazas y respuesta

La unión Gemini + función calling con GTI representa un salto cualitativo para SOCs: una IA que no solo interpreta amenazas, sino que investiga automáticamente para entregar contexto profundo al instante.

En Luma, ya estamos incorporando estas capacidades a nuestro CyberSOC de nueva generación. Si quieres que tu empresa disponga de una defensa con IA integrada, contexto automatizado y respuesta ágil, [contáctanos para conocer cómo podemos ayudarte.](https://lumacloud.co/contactenos/)

**Fuentes usadas**

- Function calling con Gemini API https://ai.google.dev/gemini-api/docs/function-calling

- Gemini en Threat Intelligence – Google Cloud blog https://cloud.google.com/blog/topics/threat-intelligence/gemini-malware-analysis-code-interpreter-threat-intelligence/

- Google Threat Intelligence: características https://cloud.google.com/security/products/threat-intelligence?hl=es_419

- Tool use con Live API — Gemini API documentos https://ai.google.dev/gemini-api/docs/live-tools

- Google Threat Intelligence Feature Roundup (Q3 2024) https://security.googlecloudcommunity.com/community-blog-42/google-threat-intelligence-q3-2024-feature-roundup-3916