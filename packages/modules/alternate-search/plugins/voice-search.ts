// ---------------------------------------------------------------------------
// Voice-search plugin — speech-to-text transcription and query normalisation
// ---------------------------------------------------------------------------
//
// Intercepts `ctx.query.audio` (a Buffer / Uint8Array) or
// `ctx.meta.audioUrl` (a remote audio URL) and replaces `ctx.query.q` with
// the transcription before passing to the search adapter.
//
// Supports a generic `transcribe` hook that wraps any STT provider
// (OpenAI Whisper, Google Speech-to-Text, AssemblyAI, etc.).
//
// Also normalises spoken-language artefacts ("um", "uh", filler words)
// from the transcription.
// ---------------------------------------------------------------------------

import type { IndexSchema, SearchPlugin } from "../core/types";

declare module "../core/types" {
	interface SearchPluginRegistry {
		"voice-search": { creator: typeof voiceSearch };
	}
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TranscribeInput =
	| { type: "buffer"; data: Uint8Array; mimeType?: string }
	| { type: "url"; url: string };

export type VoiceSearchOptions = {
	/**
	 * Async function that receives audio input and returns the transcript text.
	 */
	transcribe: (input: TranscribeInput) => Promise<string>;
	/**
	 * Language hint (BCP-47 tag, e.g. "en-US", "es-ES").
	 * Passed through to the transcription provider where applicable.
	 */
	language?: string;
	/**
	 * Strip common spoken filler words from the transcript.
	 * Default: true.
	 */
	stripFillers?: boolean;
	/**
	 * Additional filler words specific to your user base.
	 */
	customFillers?: string[];
	/**
	 * Custom post-processing of the raw transcript.
	 */
	postProcess?: (transcript: string) => string;
};

// ---------------------------------------------------------------------------
// Filler words
// ---------------------------------------------------------------------------

const DEFAULT_FILLERS = new Set([
	"um", "uh", "er", "ah", "like", "you know", "kind of", "sort of",
	"i mean", "actually", "basically", "literally",
]);

function stripFillerWords(text: string, extra?: string[]): string {
	const fillers = extra
		? new Set([...DEFAULT_FILLERS, ...extra.map((f) => f.toLowerCase())])
		: DEFAULT_FILLERS;
	return text
		.split(/\s+/)
		.filter((w) => !fillers.has(w.toLowerCase()))
		.join(" ")
		.trim();
}

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

export function voiceSearch(options: VoiceSearchOptions): SearchPlugin {
	const shouldStripFillers = options.stripFillers !== false;

	return {
		id: "voice-search",

		init(_indexes: Record<string, IndexSchema>) {},

		async beforeQuery(ctx) {
			const audioBuffer = ctx.meta.audioBuffer as Uint8Array | undefined;
			const audioUrl    = ctx.meta.audioUrl    as string      | undefined;

			if (!audioBuffer && !audioUrl) return; // not a voice query

			const input: TranscribeInput = audioBuffer
				? { type: "buffer", data: audioBuffer, mimeType: ctx.meta.audioMimeType as string | undefined }
				: { type: "url", url: audioUrl! };

			let transcript = await options.transcribe(input);

			if (shouldStripFillers) {
				transcript = stripFillerWords(transcript, options.customFillers);
			}

			if (options.postProcess) {
				transcript = options.postProcess(transcript);
			}

			ctx.query.q          = transcript.trim() || ctx.query.q;
			ctx.meta.transcript  = transcript;
			ctx.meta.voiceSearch = true;
		},
	};
}
