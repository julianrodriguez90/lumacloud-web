# Respaldo del WordPress actual (lumacloud.co)

Antes del cambio de DNS a la web nueva, asegura una copia fría completa del WordPress.
Con tu usuario administrador, haz estas 3 cosas (30 minutos aprox.):

## 1. Exportar el contenido (WXR)

1. Entra a `wp-admin` → **Herramientas → Exportar**
2. Selecciona **"Todo el contenido"** y descarga el archivo XML
3. Guárdalo en Drive/local con fecha: `lumacloud-wxr-2026-07-10.xml`

Esto respalda posts, páginas, comentarios, menús y taxonomías en formato reimportable en cualquier WordPress.

## 2. Respaldo completo con UpdraftPlus

1. **Plugins → Añadir nuevo** → busca **UpdraftPlus** (gratuito) → instalar y activar
2. **Ajustes → Copias de seguridad UpdraftPlus** → botón **"Respaldar ahora"**
3. Marca **base de datos + archivos** (plugins, temas, uploads, otros)
4. Cuando termine, descarga los 5 archivos desde la pestaña "Copias existentes" a tu computador/Drive

Esto permite restaurar el sitio completo (incluida la configuración de Elementor, WooCommerce y Zoho) si algún día se necesita.

## 3. Congelar credenciales y accesos

- Exporta la lista de usuarios (**Usuarios → Todos**) o al menos anota los administradores
- Verifica que tienes acceso al panel del hosting y al registrador del dominio (allí se hará el cambio de DNS)
- Si hay formularios Zoho u otras integraciones, anota qué cuentas las alimentan

## Después del lanzamiento

- **No borres el WordPress**: déjalo apagado o accesible en un subdominio privado (ej. `old.lumacloud.co` protegido con contraseña) durante al menos 3 meses
- El contenido ya fue extraído a este repo (`content-source/` + `scripts/originals/wp-media/` local) y funciona como fuente de verdad de la web nueva

## Qué ya está respaldado en este repo (automático)

| Qué | Dónde | Cantidad |
|---|---|---|
| Posts del blog | `content-source/posts/` (JSON + Markdown) | 89 |
| Páginas | `content-source/pages/` (JSON + Markdown + HTML) | 42 |
| Metadatos de medios | `content-source/media.json` | 828 |
| Imágenes originales | `scripts/originals/wp-media/` (solo local, no en git) | 817 |
| Inventario de URLs | `content-source/INVENTORY.md` | — |
| Catálogo visual | `content-source/MEDIA-CATALOG.md` | — |
