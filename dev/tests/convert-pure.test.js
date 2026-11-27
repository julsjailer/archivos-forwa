// Pruebas unitarias de ensambladores/formato que no dependen del navegador ni de WhatsApp.
const test = require("node:test");
const assert = require("node:assert/strict");

global.window = { WAAS: {} };
require("../../extension/src/convert.js");
const I = window.WAAS._internals;

function crc(bytes) {
  let c = 0;
  for (const b of bytes) {
    c = ((c << 8) ^ TABLE[((c >>> 24) ^ b) & 0xff]) >>> 0;
  }
  return c >>> 0;
}
const TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let r = i << 24;
    for (let j = 0; j < 8; j++) r = r & 0x80000000 ? (r << 1) ^ 0x04c11db7 : r << 1;
    t[i] = r >>> 0;
  }
  return t;
})();

function verifyOggPages(bytes) {
  let pos = 0, pages = 0;
  while (pos < bytes.length) {
    assert.equal(String.fromCharCode(...bytes.slice(pos, pos + 4)), "OggS");
    const nSegments = bytes[pos + 26];
    const headerEnd = pos + 27 + nSegments;
    const dataSize = bytes.slice(pos + 27, headerEnd).reduce((a, b) => a + b, 0);
    const end = headerEnd + dataSize;
    const page = bytes.slice(pos, end);
    const expected = new DataView(page.buffer, page.byteOffset, page.byteLength).getUint32(22, true);
    page.fill(0, 22, 26);
    assert.equal(crc(page), expected, "CRC de página Ogg válido");
    pos = end;
    pages++;
  }
  assert.equal(pos, bytes.length);
  return pages;
}

test("plan mantiene cuadros dentro del rango y duración total", () => {
  const p = I.plan(20, 2, 10, 20);
  assert.equal(p.length, 20);
  assert.equal(p.reduce((s, f) => s + f.durationMs, 0), 2000);
  assert.ok(p.every((f) => f.idx >= 0 && f.idx < 20 && f.durationMs > 0));
});

test("fitTimeline produce el número de cuadros esperado y no sale del arreglo", () => {
  const frames = Array.from({ length: 4 }, (_, i) => ({ id: i }));
  const repeated = I.fitTimeline(frames, 1, 2, 4, "repetir");
  assert.equal(repeated.length, 8);
  assert.deepEqual(repeated.map((f) => f.id), [0, 1, 2, 3, 0, 1, 2, 3]);
  const frozen = I.fitTimeline(frames, 1, 2, 4, "congelar");
  assert.equal(frozen.at(-1).id, 3);
});

test("EXIF WA contiene JSON legible con metadatos", () => {
  const meta = { "sticker-pack-name": "Prueba", "sound-sha256": "hash", emojis: ["🔊"] };
  const exif = I.exifWhatsApp(meta);
  assert.equal(String.fromCharCode(...exif.slice(0, 4)), "MM\0*");
  const offset = new DataView(exif.buffer).getUint32(18);
  const json = new TextDecoder().decode(exif.slice(offset));
  assert.deepEqual(JSON.parse(json), meta);
});

test("WebP animado contiene chunks base y ANMF por cuadro", () => {
  const payload = new Uint8Array([86, 80, 56, 32, 3, 0, 0, 0, 1, 2, 3]); // chunk VP8
  const webp = I.buildAnimatedWebp([{ payload, hasAlpha: false, durationMs: 100 }, { payload, hasAlpha: false, durationMs: 200 }], null, 512);
  assert.equal(String.fromCharCode(...webp.slice(0, 4)), "RIFF");
  assert.equal(String.fromCharCode(...webp.slice(8, 12)), "WEBP");
  const chunks = I.readChunks(webp);
  assert.equal(chunks[0].fourcc, "VP8X");
  assert.equal(chunks[1].fourcc, "ANIM");
  assert.equal(chunks.filter((c) => c.fourcc === "ANMF").length, 2);
});

test("WebP estático con EXIF se ensambla correctamente", () => {
  const payload = new Uint8Array([86, 80, 56, 32, 3, 0, 0, 0, 4, 5, 6, 0]);
  const exif = I.exifWhatsApp({ "sound-sha256": "demo" });
  const bytes = I.buildStillWebp({ payload, hasAlpha: false }, exif, 512);
  const chunks = I.readChunks(bytes);
  assert.equal(chunks[0].fourcc, "VP8X");
  assert.ok(chunks.some((c) => c.fourcc === "EXIF"));
});

test("Ogg Opus genera cabeceras, páginas y CRC verificable", () => {
  const packets = Array.from({ length: 5 }, (_, i) => new Uint8Array([i + 1, 2, 3, 4]));
  const ogg = I.buildOggOpus(packets, 312, 48000);
  assert.equal(String.fromCharCode(...ogg.slice(0, 4)), "OggS");
  assert.ok(verifyOggPages(ogg) >= 3);
});
