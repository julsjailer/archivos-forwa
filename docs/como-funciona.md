# Cómo funciona un sticker con sonido

Notas técnicas obtenidas de stickers con sonido reales y del código de WhatsApp Web (noviembre de 2026). WhatsApp puede cambiar cualquiera de estos detalles.

## 1. Dos archivos en un solo mensaje

Un sticker con sonido son **dos archivos separados** dentro del mismo mensaje:

1. el sticker `.webp` (estático o animado), que se sube como `sticker`;
2. un audio Ogg/Opus (o M4A), que se sube como `audio`, igual que una nota de voz.

El `.webp` **no contiene el audio**. Solo lleva en su EXIF la clave `"sound-sha256"`: el SHA-256, en base64, del audio sin cifrar. El vínculo real entre los dos archivos está en el mensaje.

## 2. Estructura del mensaje (protobuf)

```
Message {
  audioStickerMessage (134): FutureProofMessage {
    message (1): Message {
      stickerMessage (26): StickerMessage {
        url, fileSha256, fileEncSha256, mediaKey, mimetype = "image/webp",
        height, width, directPath, fileLength, mediaKeyTimestamp, isAnimated, emojis, …
        audioMessage (26): AudioMessage {            // oneof "audio"
          url, directPath, mediaKey, mediaKeyTimestamp,
          fileSha256, fileEncSha256, fileLength,
          seconds, mimetype = "audio/ogg; codecs=opus"
        }
      }
    }
  }
}
```

- WhatsApp Web arma `{stickerMessage: {…, audioMessage}}` y lo envuelve en `audioStickerMessage` solo si hay audio.
- Se envía con `<message type="media">` y `<enc mediatype="sticker">`.
- Al recibir, el audio se descarta si `mediaKey`, `fileSha256` o `fileEncSha256` no miden 32 bytes, si falta `directPath`/`url` o si el `mimetype` no es válido.

## 3. El audio

| Aspecto | Valor |
|---|---|
| Formatos aceptados | `audio/ogg; codecs=opus`, `audio/mp4`, `audio/m4a`, `audio/x-m4a` |
| Peso máximo | 1.000.000 bytes (WhatsApp Web no reproduce clips más grandes) |
| Tipo de subida | `audio` (claves "WhatsApp Audio Keys") |
| Formato habitual | Opus mono, 48 kHz, ~32 kbps |

## 4. El sticker

- WebP animado. El EXIF tiene un bloque TIFF big-endian con el tag `0x5741` ("WA"), que contiene un JSON con:
  - `sticker-pack-id`
  - `sticker-pack-name` (paquete)
  - `sticker-pack-publisher` (autor)
  - `emojis`
  - `sound-sha256`
- El servidor de WhatsApp rechaza stickers de más de ~1 MB (HTTP 413).
- La guía oficial de packs de stickers exige que cada cuadro dure al menos 8 ms.
- **Duración:** WhatsApp no exige que el audio y la animación duren lo mismo; no lo comprueba al enviar ni al recibir. Al tocar el sticker, WhatsApp Web reproduce la animación una vez y el audio una vez, cada uno por su lado. En los stickers reales observados ambos duran lo mismo. Con duraciones distintas, en la prueba en el celular WhatsApp repitió el audio en bucle; no hay forma de controlarlo desde el sticker.
- Todos los stickers con sonido reales observados son animados. Un sticker fijo con sonido es válido para el protocolo, pero no está comprobado que los clientes lo reproduzcan.

## 5. Opciones de la cuenta

WhatsApp activa la función por cuenta con estas opciones (AB props):

- `sound_stickers_consumption_enabled`
- `sound_stickers_creation_enabled`
- `sound_stickers_audio_playing_enabled`

Si la creación no está activa, WhatsApp Web descarta el audio al enviar. La extensión activa las tres **solo en tu navegador**.

## 6. Qué hace la extensión

0. **Fuentes:** la imagen puede ser un video (`<video>`), un GIF, WebP animado o APNG (`ImageDecoder` de WebCodecs) o una imagen fija. El audio puede venir del mismo video o de otro archivo de audio o video, con su propio tramo.
   - Por defecto la animación y el audio conservan cada uno su duración. Opcionalmente, si la animación dura menos que el audio, se repite o se queda en su último cuadro (y si dura más, se corta al largo del audio).
   - El análisis solo depende de la animación: el audio se sube como archivo aparte y no suma al peso del sticker. Por eso cambiar el tramo de audio no obliga a recalcular, salvo cuando la animación se ajusta a su duración.
   - Una imagen fija se envía como WebP animado de un solo cuadro que dura lo que el audio (o, como prueba, como WebP fijo).
   - Al cortar un audio aparte se aplica un fundido de 8 ms en los bordes para evitar clics.
1. **Recorte:** el visor cuenta el tiempo desde el primer cuadro real. Algunos videos recortados tienen marcas de tiempo que empiezan, por ejemplo, en 130 s.
2. **Análisis** (`analyze`):
   - Captura el tramo una vez, cuadro por cuadro, tomando cada cuadro en la mitad de su intervalo. Si se toma justo en el borde, el navegador a veces devuelve el cuadro anterior.
   - Guarda una huella de 32×32 de cada cuadro para detectar repetidos.
   - Codifica una muestra de cuadros en cada resolución y estima el peso de cada combinación de resolución y fps. Las estimaciones suelen acertar con un ±5 %.
3. **Creación** (`create`):
   - El audio se decodifica con WebAudio, se pasa a mono a 48 kHz, se codifica a Opus con WebCodecs y se empaqueta en Ogg.
   - Los cuadros se codifican a WebP con el canvas del navegador y se arma el WebP animado. Los cuadros repetidos se fusionan.
   - Si el sticker pasa de 1 MB, se baja la calidad.
4. **Envío:** usa los módulos internos de WhatsApp Web para subir el audio (`encryptAndUpload`) y enviar el sticker (`MediaPrep.sendToChat` con `stickerAudio`). Opcionalmente abre el diálogo nativo de **Reenviar**.
