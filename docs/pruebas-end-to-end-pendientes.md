# Lista de pruebas end-to-end (pendientes de ejecución real)

Estas pruebas no se sustituyen por CI sintáctico/unitario. Deben ejecutarse en WhatsApp Web real y con dispositivos receptores, sin cambiar el protocolo de audio-sticker entre pruebas.

## Verificación de la función principal
- [ ] Video con sonido: recortar tramo, analizar, crear, reproducir la previsualización de WebP + audio y comprobar que ambos empiezan juntos.
- [ ] Video sin sonido + audio de otro archivo: crear y verificar la asociación.
- [ ] Imagen fija + audio: generar, previsualizar y enviar.
- [ ] GIF/WebP animado/APNG + audio: verificar captura, duración y animación.
- [ ] Recortes de audio y video independientes.
- [ ] Probar las opciones repetir/congelar/independiente.
- [ ] Probar compensación de sincronización con video de calibración.
- [ ] Comprobar tamaño del WebP y del audio; no exceder límites.
- [ ] Enviar a chat propio; confirmar estado de envío y metadatos de audio-sticker.
- [ ] Abrir Reenviar; reenviar a un chat de prueba.
- [ ] Recibir en otro dispositivo; confirmar que se reproduce el audio al tocar el sticker y que la animación se reproduce.
- [ ] Repetir con audio de duración distinta a la animación.
- [ ] Cancelar durante captura y durante codificación; confirmar que se libera el panel y puede volver a crear.
- [ ] Repetir con un video largo y vigilar memoria/estabilidad.

## Compatibilidad
- [ ] Chrome estable actual.
- [ ] Edge estable actual.
- [ ] Confirmar diagnóstico de capacidades antes de crear.
- [ ] Confirmar que una capacidad faltante muestra mensaje comprensible y no genera un archivo parcialmente inválido.

## Registro de resultados
Para cada prueba anotar: fecha, navegador/versión, fuente, duración, resolución/FPS seleccionados, peso WebP, peso Ogg, resultado de envío, recepción/reproducción y registro de errores (revisado/redactado antes de compartir).

**Estado actual:** pendientes todas las pruebas de envío/recepción reales. CI valida sintaxis, rutas, formatos de contenedor y CRC de Ogg; no valida la codificación real WebCodecs ni el comportamiento de WhatsApp.
