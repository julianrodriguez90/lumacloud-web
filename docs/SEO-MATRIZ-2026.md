# Matriz SEO operativa — julio de 2026

**Estado:** fuente operativa para producción de contenido. Complementa y corrige la ejecución propuesta en `Plan_Maestro_pSEO_LumaCloud.docx`; no reemplaza sus datos históricos de Semrush.

## Decisiones vigentes

1. Una intención principal tiene una sola URL canónica. Variaciones semánticas cercanas se trabajan como keywords secundarias, no como páginas duplicadas.
2. Los materiales aprobados por el cliente prevalecen sobre el WordPress y sobre cualquier supuesto del plan.
3. No se publican páginas locales o sectoriales en lote. Cada URL debe superar los gates de calidad de este documento.
4. Las cifras de volumen/KD del Plan Maestro son una fotografía de mayo de 2026. Deben revalidarse antes de cada sprint y contrastarse con Search Console después del lanzamiento.
5. LumaCloud implementa controles y acompaña la preparación para ISO 27001; no emite certificaciones ni presta asesoría legal.
6. `+11 años`, `+6 países`, el mapa regional y los 23 nombres textuales de organizaciones son evidencia comercial aprobada por el cliente. Los logos de la presentación son privados y no están autorizados para publicación. El teléfono vigente no cambia hasta nueva confirmación.

## Propiedad canónica por cluster

| Cluster / intención | URL canónica | Estado | Decisión de contenido |
|---|---|---|---|
| ciberseguridad empresarial / para empresas en Colombia | `/ciberseguridad` | Publicada | Hub comercial. Absorbe variantes casi equivalentes; no crear una segunda página por “empresas Colombia”. |
| consultoría de ciberseguridad | `/ciberseguridad/consultoria` | Publicada | Servicio especializado. |
| auditoría de ciberseguridad | `/ciberseguridad/auditoria` | Publicada | Servicio especializado. |
| empresa de ciberseguridad Bogotá | `/ciberseguridad/bogota` | Publicada | Canon local vigente. No crear `/bogota-colombia`. |
| empresa de ciberseguridad Medellín | `/ciberseguridad/medellin` | Publicada | Canon local vigente. |
| protección de datos empresariales | `/ciberseguridad/proteccion-datos` | Pendiente | Página comercial; diferenciar de Ley 1581 y enlazarla. |
| evaluación / madurez de ciberseguridad | `/herramientas/evaluacion-ciberseguridad` | Publicada | Herramienta canónica; CTA a `/ciberseguridad`. |
| backup empresarial | `/backup` | Publicada | Hub. No competir con nube/BaaS por la misma intención principal. |
| backup en la nube | `/backup/nube` | Publicada | Solución específica. |
| Backup as a Service / BaaS | `/backup/baas` | Publicada | Servicio administrado. |
| backup corporativo | `/backup/corporativo` | Pendiente | Enfocar en gobierno, escala y continuidad; evitar duplicar el hub. |
| backup automatizado | `/backup/automatizado` | Pendiente | Enfocar en políticas, operación y monitoreo. |
| RTO y RPO | `/herramientas/calculadora-rto-rpo` | Publicada | Herramienta canónica y activo enlazable. |
| cloud empresarial | `/cloud` | Publicada | Hub de nube. |
| cloud privado | `/cloud/privado` | Publicada | Servicio específico. |
| migración a la nube | `/cloud/migracion` | Publicada | Servicio específico; mantener “migración gratuita” solo con el alcance autorizado. |
| IaaS | `/cloud/iaas` | Pendiente | Página comercial cuando exista contenido factual suficiente. |
| PaaS | `/cloud/paas` | Pendiente | Página comercial cuando exista contenido factual suficiente. |
| data center Colombia | `/infraestructura/data-center` | Pendiente | Primer hub comercial de infraestructura. |
| colocation Colombia | `/infraestructura/colocation` | Pendiente | Debe enlazar al hub de infraestructura. |
| SOC as a Service / CyberSOC | `/soc` | Publicada | Hub comercial. |
| SIEM administrado | `/soc/siem` | Pendiente | Servicio FortiSIEM; no atribuir SLA no documentado. |
| monitoreo de seguridad 24/7 | `/soc/monitoreo` | Pendiente | Diferenciar monitoreo continuo de SIEM como tecnología. |
| gestión de incidentes | `/soc/gestion-incidentes` | Pendiente | Relacionar con `/csirt` sin competir por la misma intención. |
| respuesta a incidentes / CSIRT | `/csirt` | Publicada | Canon para capacidad CSIRT. |
| implementación ISO 27001 | `/cumplimiento/iso-27001` | Publicada | Canon también para búsquedas de preparación/certificación, aclarando que LumaCloud no certifica. |
| Ley 1581 / controles técnicos | `/cumplimiento/ley-1581` | Publicada | No presentar como asesoría legal. |
| evaluación ISO 27001 | `/herramientas/evaluador-iso-27001` | Publicada | Autoevaluación orientativa, no certificación. |
| phishing test / simulador de phishing | `/herramientas/test-phishing` | Publicada | Única URL. No crear `/herramientas/simulador-phishing`; redirigir si llegara a usarse externamente. |
| capacitación en ciberseguridad | `/servicios/capacitacion-ciberseguridad` | Pendiente | Hub comercial del silo educativo. |
| IA empresarial / agentes de IA | `/plataforma-ia-lci` | Publicada | Cluster aprobado por el cliente, separado del pSEO masivo. `/gonemo` queda como ruta histórica publicada. |

## Evergreen priorizados

| Orden | Slug objetivo | Intención | Enlace comercial principal |
|---:|---|---|---|
| 1 | `/blog/que-es-phishing` | Definición y prevención de phishing | `/herramientas/test-phishing` y `/ciberseguridad` |
| 2 | `/blog/tipos-ataques-ciberneticos` | Tipos de ataques y mitigación | `/ciberseguridad` |
| 3 | `/blog/ciberseguridad-pymes-colombia` | Guía práctica para pymes colombianas | `/herramientas/evaluacion-ciberseguridad` |
| 4 | `/blog/backup-nube-vs-local` | Comparación y criterios de decisión | `/backup/nube` |
| 5 | `/blog/plan-drp-colombia` | Cómo estructurar un DRP | `/herramientas/calculadora-rto-rpo` |
| 6 | `/blog/ransomware-colombia` | Riesgo y respuesta, sin año en el slug | `/backup` y `/csirt` |
| 7 | `/blog/phishing-colombia-empresas` | Contexto empresarial colombiano | `/herramientas/test-phishing` |
| 8 | `/blog/ciberseguridad-colombia-2026` | Informe fechado | `/ciberseguridad`; actualizar o consolidar en 2027 |

Antes de crear cada artículo se debe revisar si un post migrado ya satisface parcialmente la intención. Si existe solapamiento, se actualiza/consolida y se redirige, en vez de sumar otra URL débil.

## Gates para páginas locales y sectoriales

Una página local o sectorial solo puede pasar de `draft/noindex` a indexable cuando cumpla todos los puntos:

- demanda e intención revalidadas en la SERP;
- oferta real y cobertura confirmada por LumaCloud;
- evidencia específica que no pueda obtenerse sustituyendo el nombre de la ciudad o sector;
- contenido factual respaldado por el corpus o material del cliente;
- propuesta, riesgos, casos de uso y FAQs realmente diferenciados;
- revisión humana técnica y editorial;
- comparación de similitud/canibalización con hubs y páginas hermanas;
- enlaces internos bidireccionales y CTA asociado;
- title, description, H1, canonical, breadcrumbs y schema validados;
- aprobación explícita para indexar.

El piloto máximo inicial es de tres páginas. Se evalúa durante 8–12 semanas con Search Console antes de escalar. El número de URLs publicadas no es un KPI de éxito.

## Autoría y revisión

- Los posts migrados conservan por ahora la autoría organizacional `Equipo LumaCloud` porque no existe una asignación verificable por persona.
- Los artículos nuevos deben identificar autor o revisor técnico real cuando el cliente proporcione nombre, cargo, especialidad y aprobación.
- No se inventan perfiles ni revisiones retroactivas.
- Toda estadística enlaza la fuente primaria y registra fecha/alcance.
- Guías de cumplimiento incluyen el límite: controles técnicos, no certificación ni asesoría legal.

## Medición posterior al lanzamiento

La meta central es **pipeline calificado originado o asistido por orgánico**, no URLs publicadas.

Dashboard mínimo por cluster:

- consultas, impresiones, clics, CTR y posición en Search Console;
- landing de primer toque, última página útil y CTA de conversión;
- `generate_lead` por servicio/herramienta;
- leads trabajados, calificados y convertidos desde Zoho;
- páginas indexadas/excluidas y motivos;
- consultas donde dos URLs compiten entre sí;
- Core Web Vitals de campo.

Las metas de tráfico del Plan Maestro se mantienen como hipótesis. A los 30, 60 y 90 días se reemplazan por escenarios conservador/base/agresivo usando datos reales.

## Fuentes metodológicas vigentes

- Google Search: [contenido útil y orientado a personas](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- Google Search: [políticas de spam y contenido producido a escala](https://developers.google.com/search/docs/essentials/spam-policies)
- Google Search: [funciones de IA y requisitos normales de SEO](https://developers.google.com/search/docs/appearance/ai-features)
- Google Search: [versiones localizadas y `hreflang`](https://developers.google.com/search/docs/specialty/international/localized-versions)
