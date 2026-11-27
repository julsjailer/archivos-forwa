# Stickers con sonido

**Stickers con sonido** es una extensión no oficial para WhatsApp Web que permite crear stickers animados o fijos con audio asociado, a partir de videos, imágenes o GIF/animaciones, y enviarlos desde el chat abierto.

> Proyecto independiente. No está afiliado, patrocinado ni respaldado por WhatsApp/Meta.

## Estado del proyecto

- **Versión actual:** 0.7.6
- **Plataforma:** navegador Chromium compatible con extensiones Manifest V3 (Chrome, Edge y derivados compatibles).
- **Sitio objetivo:** WhatsApp Web (`https://web.whatsapp.com`).
- **Estado:** código y paquete revisados; CI automatizado disponible. El envío/recepción end-to-end debe validarse en WhatsApp Web y con otro dispositivo; no se afirma que todas las combinaciones estén probadas en vivo.

## Funciones

### Fuentes de medios
- **Video con sonido:** usa el video y su pista de audio; puedes seleccionar el tramo.
- **Imagen + audio:** una imagen fija y un audio/video externo. La imagen se convierte en sticker animado de un solo cuadro que dura lo seleccionado del audio.
- **Video o GIF + audio:** visual animado y audio independiente; admite fuentes visuales animadas y elegir otra fuente de audio.
- Formatos de imagen habituales (JPG, PNG, WebP) y formatos de audio habituales, incluyendo MP3, M4A, OGG, WAV y otros que el navegador pueda decodificar.
- Video: MP4, MOV, WebM, MKV u otros que el navegador pueda reproducir. La compatibilidad real depende del navegador y del códec.

### Recorte y sincronización
- Recorte independiente de los tramos visual y de audio cuando corresponda.
- Controles para arrastrar las asas, mover el cursor en la pista y ajustar los segundos manualmente.
- Botones para reproducir el segmento, escuchar desde el cursor y revisar el final del tramo.
- Opciones para ajustar la duración visual al audio: repetir cuadros, congelar el último cuadro o mantener la duración independiente.
- Compensación de sincronización configurable para casos donde se requiera un pequeño retraso visual.

### Análisis y calidad
- Analiza una muestra de cuadros para estimar tamaño y combinaciones de resolución/FPS.
- Tabla de combinaciones disponibles y elección manual.
- Presets: **Equilibrado**, **Fluido**, **Calidad**, **Ligero** y **Personalizado**.
- Modo de encuadre para ajustar o recortar y llenar el cuadro.
- Ajusta calidad para procurar que el WebP quede dentro del límite de tamaño.
- Detecta y fusiona cuadros repetidos y realiza limpieza de recursos durante fallos o cancelaciones.

### Crear, previsualizar y enviar
- Genera sticker WebP (animado o fijo experimental) y audio Ogg/Opus por separado.
- Previsualización del sticker y del audio; opción de reproducirlos juntos.
- Muestra duración, dimensiones, FPS, calidad estimada/real, tamaño del WebP y del audio.
- Campos para nombre de paquete y autor, aplicados al envío.
- Envío al chat abierto; opciones adicionales para abrir el diálogo nativo de reenviar o guardar primero en el chat propio y abrir Reenviar.
- Descarga de los medios creados, según controles disponibles en la interfaz.

### Diagnóstico
- Registro de eventos, advertencias y errores con información técnica.
- Página de diagnóstico/registro con exportación JSON, copiar, filtro de errores y borrar.
- Oculta números largos en los logs, pero **puede conservar nombres de chats, archivos y otros datos**. Revisar y redactar el archivo antes de compartirlo.

## Manual de uso

1. Abre WhatsApp Web en un navegador Chromium compatible y espera a que cargue tu sesión.
2. Abre la extensión **Stickers con sonido** desde el icono de extensiones.
3. Selecciona la pestaña según tu fuente: **Video**, **Imagen + audio** o **Video/GIF + audio**.
4. Elige el archivo o archivos. Si corresponde, ajusta los tramos visual y de audio con la pista, las asas o los campos de tiempo.
5. En la sección de formato, selecciona el modo de encuadre. Pulsa **Analizar** para calcular opciones de FPS/resolución y elige un preset o una combinación manual.
6. Ajusta la compensación si tienes una razón para hacerlo. Normalmente puede dejarse en cero.
7. En **Crear y enviar**, completa los metadatos de paquete/autor si quieres. Pulsa **Crear sticker** y espera el procesamiento.
8. Revisa la previsualización visual y de audio. Usa la reproducción conjunta para comprobar el resultado.
9. Pulsa **Enviar** y selecciona el destino configurado (chat abierto, abrir Reenviar o chat propio y Reenviar). Confirma el envío en WhatsApp.
10. Comprueba el sticker desde el chat y, para validar compatibilidad, pide que lo reciban y reproduzcan en otro dispositivo.

> Si la extensión muestra un error de capacidad, navegador o códec, no fuerces el envío de un archivo que no haya terminado de crearse.

## Instalación (paquete ZIP)

1. Descarga el ZIP de la extensión desde el enlace de paquete/release que publica el proyecto.
2. Descomprime el ZIP. Debe quedar una carpeta `extension` con `manifest.json`, `background.js`, `registro.html` y `src/`.
3. En un navegador de escritorio Chromium, abre la página de extensiones, activa **Modo desarrollador** y selecciona **Cargar descomprimida**.
4. Selecciona la carpeta `extension` que contiene el manifiesto.
5. Abre o recarga WhatsApp Web y usa la extensión desde su botón.

El ZIP no es un instalador Android y la extensión no está destinada a navegadores móviles que no admitan extensiones Chromium.

## Arquitectura y auditoría del código

| Archivo | Responsabilidad |
|---|---|
| `extension/manifest.json` | Manifest V3, permisos, scripts, host de WhatsApp Web y página de diagnóstico. |
| `extension/background.js` | Service worker: acción de extensión, apertura/activación y recuperación del panel. |
| `extension/src/bridge.js` | Puente entre el contexto de extensión y la página; comunicación y persistencia del registro. |
| `extension/src/logger.js` | Registro estructurado, eventos, máscaras/sanitización y diagnóstico de capacidades. |
| `extension/src/convert.js` | Inspección de medios, captura de cuadros, análisis, WebP, audio PCM/Opus, Ogg, EXIF y conversión. |
| `extension/src/wa.js` | Integración con módulos internos de WhatsApp Web, habilitación local de sound stickers, carga y envío/reenvío. |
| `extension/src/ui.js` | Interfaz, selección de fuentes, recortes, opciones, análisis, presets, previsualización y flujo de envío. |
| `extension/src/main.js` | Inicialización y conexión de los módulos de la extensión. |
| `extension/registro.html` / `registro.js` | Visor de logs: descargar JSON, copiar, filtrar y borrar. |
| `extension/icons/icono.svg` | Icono vectorial del proyecto. |

### Permisos declarados
- `storage`: guardar preferencias y el registro local.
- Host permission `https://web.whatsapp.com/*`: acceso al sitio objetivo para integrar la interfaz y el flujo de envío.
- Scripts de contenido ejecutados en WhatsApp Web (uno temprano para el puente y el resto en el mundo principal de la página).

El proyecto no declara permisos generales de navegación ni acceso a todos los sitios. El comportamiento depende de la integración con WhatsApp Web.

## Conversión: resumen técnico

- Visual: captura cuadros del tramo elegido, analiza opciones de FPS/resolución y codifica WebP; crea WebP animado con metadatos WA.
- Audio: decodifica usando capacidades del navegador, convierte a mono/48 kHz, codifica Opus con WebCodecs y ensambla contenedor Ogg.
- Asociación: el sticker y el audio se preparan como componentes separados para el formato de sticker con sonido que maneja WhatsApp Web.
- Optimización: control de tamaño, calidad, repetición/congelación de cuadros, recorte y limpieza de recursos.

La estructura interna de WhatsApp Web y sus módulos privados no constituyen una API pública estable. Una actualización del sitio puede alterar o romper integración, carga o envío.

## Pruebas y CI

GitHub Actions incluye:

- **Validar extensión:** verifica manifiesto/rutas, sintaxis JavaScript, pruebas unitarias de ensambladores/formato y sintaxis del generador Python.
- **Empaquetar extensión:** valida rutas declaradas y genera un ZIP de la carpeta `extension` como artifact descargable.
- **Generar video de calibración:** ejecuta el script Python/FFmpeg y actualiza el MP4 en el repositorio cuando hay cambios.

Las pruebas unitarias cubren funciones puras: timeline/duración, ajuste de cuadros, EXIF WA, ensamblado WebP estático/animado y estructura Ogg/CRC. **No equivalen a una prueba real de codificación WebCodecs ni de envío y recepción por WhatsApp.**

### Pruebas reales pendientes
- Creación y previsualización de las distintas fuentes y combinaciones.
- Envío, reenvío, recepción y reproducción en otro dispositivo.
- Compatibilidad con Chrome/Edge actuales, codecs y equipos de distinta capacidad.
- Cancelación durante captura/codificación y comportamiento con archivos largos.
- Confirmar comportamiento de stickers fijos con sonido (experimental).

Consulta `docs/pruebas-end-to-end-pendientes.md` para la checklist completa, `docs/como-funciona.md` para el formato y `docs/auditoria-tecnica.md` para el historial técnico.

## Privacidad

- El procesamiento se realiza en el navegador.
- Los logs son locales en el almacenamiento de la extensión.
- Antes de compartir un diagnóstico, revísalo: puede incluir nombres de archivos, chats y datos técnicos. No incluye el contenido de mensajes de chat como parte del diseño del registro; aun así, revisa el JSON por privacidad.

## Limitaciones conocidas y riesgos

- **No oficial:** WhatsApp/Meta puede cambiar el sitio o desactivar/alterar sound stickers.
- **Dependencia de internals:** se utilizan módulos privados de WhatsApp Web; no hay garantía de compatibilidad futura.
- **Capacidades del navegador:** WebCodecs, ImageDecoder, WebAudio, WebP y códecs disponibles varían por navegador y dispositivo.
- **Memoria y rendimiento:** archivos largos, alta resolución o muchas tasas de cuadros pueden requerir memoria/CPU elevadas.
- **Tamaño:** WhatsApp impone límites al WebP y al audio; el proyecto intenta ajustarse, pero debe comprobarse el resultado.
- **Validación:** las pruebas automatizadas no garantizan la reproducción en todos los dispositivos.

## Estructura del repositorio

```
.github/
  ISSUE_TEMPLATE/       plantillas de reportes y sugerencias
  workflows/            CI, empaquetado y video de calibración
dev/
  calibracion/          video y generador de calibración
  tests/                pruebas unitarias
  harness.html           banco de pruebas de conversión
  ui-test.html           prueba visual aislada
docs/
  auditoria-tecnica.md
  como-funciona.md
  pruebas-end-to-end-pendientes.md
extension/
  background.js
  manifest.json
  registro.html
  registro.js
  icons/
  src/
```

## Soporte y reportes

- [Reportar un problema](https://github.com/julsjailer/archivos-forwa/issues/new?template=problema.yml)
- [Proponer una mejora](https://github.com/julsjailer/archivos-forwa/issues/new?template=sugerencia.yml)
- [Repositorio](https://github.com/julsjailer/archivos-forwa)

Al reportar un fallo, indica navegador/versión, sistema, versión de extensión, pasos para reproducir y adjunta un diagnóstico revisado/redactado si ayuda.

## Versión

Auditoría/documentación correspondiente a la versión **0.7.6** y al estado del repositorio en noviembre de 2026.
