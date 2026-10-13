// What an uploaded audio/video file really is, read from its bytes rather than
// the type the browser (or a script) declared. Used to keep Audio spaces
// voice-only and Video spaces video-only.
//
// Containers understood: WebM/Matroska and MP4/MOV/M4A (track types from the
// file's own track list), Ogg (Theora = video), and the audio-only formats
// MP3, WAV, FLAC, AAC (ADTS). Anything else is unknown (null).

export type SniffedMedia = {
  /** Real MIME type to store the file under. */
  type: string
  hasVideo: boolean
  hasAudio: boolean
}

/** Bytes as a one-char-per-byte string ('' when out of range). */
function ascii(b: Uint8Array, at: number, len: number): string {
  if (at < 0 || at + len > b.length) return ''
  let s = ''
  for (let i = at; i < at + len; i += 8192) {
    s += String.fromCharCode(...b.subarray(i, Math.min(at + len, i + 8192)))
  }
  return s
}

export function sniffMedia(input: Uint8Array): SniffedMedia | null {
  const b = input
  if (b.length < 12) return null
  if (b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) return sniffMatroska(b)
  if (ascii(b, 4, 4) === 'ftyp') return sniffMp4(b)
  if (ascii(b, 0, 4) === 'OggS') return sniffOgg(b)
  if (ascii(b, 0, 4) === 'RIFF' && ascii(b, 8, 4) === 'WAVE') return { type: 'audio/wav', hasVideo: false, hasAudio: true }
  if (ascii(b, 0, 4) === 'fLaC') return { type: 'audio/flac', hasVideo: false, hasAudio: true }
  if (ascii(b, 0, 3) === 'ID3') return { type: 'audio/mpeg', hasVideo: false, hasAudio: true }
  if (b[0] === 0xff && (b[1]! & 0xf6) === 0xf0) return { type: 'audio/aac', hasVideo: false, hasAudio: true } // ADTS
  if (b[0] === 0xff && (b[1]! & 0xe0) === 0xe0) return { type: 'audio/mpeg', hasVideo: false, hasAudio: true } // MPEG frame
  return null
}

// -- WebM / Matroska (EBML) ---------------------------------------------------

const EBML = { segment: 0x18538067, tracks: 0x1654ae6b, trackEntry: 0xae, trackType: 0x83, cluster: 0x1f43b675, docType: 0x4282, header: 0x1a45dfa3 }

/** A variable-length integer; `keepMarker` for element ids. */
function vint(b: Uint8Array, at: number, keepMarker: boolean): { value: number, len: number, unknown: boolean } | null {
  const first = b[at]
  if (first === undefined || first === 0) return null
  let len = 1
  while (len <= 8 && !(first & (0x80 >> (len - 1)))) len++
  if (len > 8 || at + len > b.length) return null
  let value = keepMarker ? first : first & (0xff >> len)
  let allOnes = value === (0xff >> len)
  for (let i = 1; i < len; i++) {
    value = value * 256 + b[at + i]!
    if (b[at + i] !== 0xff) allOnes = false
  }
  return { value, len, unknown: !keepMarker && allOnes }
}

function sniffMatroska(b: Uint8Array): SniffedMedia | null {
  let hasVideo = false
  let hasAudio = false
  let sawTracks = false
  let webm = false

  // Walks elements in [start, end), descending into the containers we need.
  const walk = (start: number, end: number): boolean => {
    let at = start
    while (at < end) {
      const id = vint(b, at, true)
      if (!id) return false
      const size = vint(b, at + id.len, false)
      if (!size) return false
      const body = at + id.len + size.len
      const bodyEnd = size.unknown ? end : Math.min(end, body + size.value)
      switch (id.value) {
        case EBML.header:
          if (!walk(body, bodyEnd)) return false
          break
        case EBML.docType:
          webm = ascii(b, body, size.value) === 'webm'
          break
        case EBML.segment:
          return walk(body, bodyEnd)
        case EBML.tracks:
          sawTracks = true
          walk(body, bodyEnd)
          return true // track list read; no need to look further
        case EBML.trackEntry:
          walk(body, bodyEnd)
          break
        case EBML.trackType: {
          let t = 0
          for (let i = 0; i < size.value && i < 8; i++) t = t * 256 + b[body + i]!
          if (t === 1) hasVideo = true
          if (t === 2) hasAudio = true
          break
        }
        case EBML.cluster:
          return true // media data before any track list: give up
      }
      if (size.unknown) return true
      at = body + size.value
    }
    return true
  }

  walk(0, b.length)
  if (!sawTracks || (!hasVideo && !hasAudio)) return null
  const container = webm ? 'webm' : 'x-matroska'
  return { type: `${hasVideo ? 'video' : 'audio'}/${container}`, hasVideo, hasAudio }
}

// -- MP4 / MOV / M4A (ISO BMFF) -----------------------------------------------

const MP4_CONTAINERS = new Set(['moov', 'trak', 'mdia'])

function sniffMp4(b: Uint8Array): SniffedMedia | null {
  const view = new DataView(b.buffer, b.byteOffset, b.byteLength)
  let hasVideo = false
  let hasAudio = false
  let sawTrack = false
  const brand = ascii(b, 8, 4)

  const walk = (start: number, end: number) => {
    let at = start
    while (at + 8 <= end) {
      let size = view.getUint32(at)
      const type = ascii(b, at + 4, 4)
      let header = 8
      if (size === 1) {
        if (at + 16 > end) return
        size = Number(view.getBigUint64(at + 8))
        header = 16
      } else if (size === 0) {
        size = end - at
      }
      if (size < header) return
      const boxEnd = Math.min(end, at + size)
      if (MP4_CONTAINERS.has(type)) {
        if (type === 'trak') sawTrack = true
        walk(at + header, boxEnd)
      } else if (type === 'hdlr') {
        const handler = ascii(b, at + header + 8, 4) // version/flags, pre_defined, handler_type
        if (handler === 'vide') hasVideo = true
        if (handler === 'soun') hasAudio = true
      }
      at += size
    }
  }

  walk(0, b.length)
  if (!sawTrack || (!hasVideo && !hasAudio)) return null
  const quicktime = brand === 'qt  '
  const type = hasVideo
    ? (quicktime ? 'video/quicktime' : 'video/mp4')
    : 'audio/mp4'
  return { type, hasVideo, hasAudio }
}

// -- Ogg ------------------------------------------------------------------------

function sniffOgg(b: Uint8Array): SniffedMedia | null {
  // Each stream's first packet (in the first pages) names its codec.
  const head = ascii(b, 0, Math.min(b.length, 64 * 1024))
  const hasVideo = /\x80theora|\x01video\0\0\0/.test(head)
  const hasAudio = /OpusHead|\x01vorbis|\x7fFLAC|Speex {3}/.test(head)
  if (!hasVideo && !hasAudio) return null
  return { type: hasVideo ? 'video/ogg' : 'audio/ogg', hasVideo, hasAudio }
}
