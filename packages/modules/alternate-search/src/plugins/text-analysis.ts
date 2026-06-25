// ---------------------------------------------------------------------------
// Text-analysis plugin — stemming, language detection, custom analyzers
// ---------------------------------------------------------------------------
//
// Pre-processes the query string before tokenization: detects the probable
// language of the input, applies a configurable stemmer (Porter for EN,
// light stemmers for ES/DE/FR), and supports user-supplied analyzers.
// Results are written back to `ctx.query.q` (normalized) and
// `ctx.query.locale` (detected language).
// ---------------------------------------------------------------------------

import type { IndexSchema, SearchPlugin } from "../core/types";

declare module "../core/types" {
	interface SearchPluginRegistry {
		"text-analysis": { creator: typeof textAnalysis };
	}
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BuiltinStemmer = "porter-en" | "light-es" | "light-de" | "light-fr" | "none";

export type TextAnalysisOptions = {
	/**
	 * Which built-in stemmer to use.  Set to "none" to disable.
	 * Default: "porter-en".
	 */
	stemmer?: BuiltinStemmer;
	/**
	 * Detect language from the query string and write it to `ctx.query.locale`.
	 * Default: false.
	 */
	detectLanguage?: boolean;
	/**
	 * Custom analyzer function — receives the raw query and locale,
	 * returns the normalized query string.
	 */
	analyze?: (text: string, locale: string) => string;
	/**
	 * Normalize Unicode (NFC), fold diacritics, and lowercase.
	 * Default: true.
	 */
	normalize?: boolean;
};

// ---------------------------------------------------------------------------
// Minimal Porter stemmer (EN) — suffix-stripping
// ---------------------------------------------------------------------------

const VOWELS = /[aeiou]/;

function measure(stem: string): number {
	// Simplified measure (VC count)
	let m = 0, prev = false;
	for (const ch of stem) {
		const isV = VOWELS.test(ch);
		if (!prev && isV) { /* nothing */ } else if (prev && !isV) m++;
		prev = isV;
	}
	return m;
}

function porterStem(word: string): string {
	if (word.length < 4) return word;
	let w = word;
	// Step 1a
	if (w.endsWith("sses")) w = w.slice(0, -2);
	else if (w.endsWith("ies")) w = w.slice(0, -2);
	else if (!w.endsWith("ss") && w.endsWith("s")) w = w.slice(0, -1);
	// Step 1b
	if (w.endsWith("eed")) { if (measure(w.slice(0, -3)) > 0) w = w.slice(0, -1); }
	else if (w.endsWith("ed") && VOWELS.test(w.slice(0, -2))) {
		w = w.slice(0, -2);
		if (w.endsWith("at") || w.endsWith("bl") || w.endsWith("iz")) w += "e";
	} else if (w.endsWith("ing") && VOWELS.test(w.slice(0, -3))) {
		w = w.slice(0, -3);
		if (w.endsWith("at") || w.endsWith("bl") || w.endsWith("iz")) w += "e";
	}
	// Step 1c
	if (w.endsWith("y") && VOWELS.test(w.slice(0, -1))) w = w.slice(0, -1) + "i";
	return w;
}

// Basic diacritic folding
function foldDiacritics(text: string): string {
	return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Naive language detection by script/word fingerprint
function detectLang(text: string): string {
	if (/[äöüß]/i.test(text)) return "de";
	if (/[áéíóúñ¿¡]/i.test(text)) return "es";
	if (/[àâçéèêîïôùûœæ]/i.test(text)) return "fr";
	return "en";
}

function lightStem(word: string, lang: "es" | "de" | "fr"): string {
	if (lang === "es") {
		const suffixes = ["aciones", "acion", "ando", "ando", "aron", "aste", "iste", "iendo", "os", "as", "es", "s"];
		for (const s of suffixes) { if (word.endsWith(s) && word.length > s.length + 2) return word.slice(0, -s.length); }
	} else if (lang === "de") {
		const suffixes = ["ungen", "ung", "heit", "keit", "schaft", "lich", "isch", "sten", "ten", "en", "er", "em", "es"];
		for (const s of suffixes) { if (word.endsWith(s) && word.length > s.length + 2) return word.slice(0, -s.length); }
	} else if (lang === "fr") {
		const suffixes = ["ement", "ments", "ment", "ation", "tions", "tion", "ons", "ant", "aux", "er", "ir", "re", "es", "s"];
		for (const s of suffixes) { if (word.endsWith(s) && word.length > s.length + 2) return word.slice(0, -s.length); }
	}
	return word;
}

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

export function textAnalysis(options: TextAnalysisOptions = {}): SearchPlugin {
	const stemmerType  = options.stemmer ?? "porter-en";
	const doDetect     = options.detectLanguage ?? false;
	const doNormalize  = options.normalize !== false;

	function stemToken(token: string, locale: string): string {
		if (stemmerType === "none") return token;
		if (stemmerType === "porter-en") return porterStem(token);
		if (stemmerType === "light-es" || locale === "es") return lightStem(token, "es");
		if (stemmerType === "light-de" || locale === "de") return lightStem(token, "de");
		if (stemmerType === "light-fr" || locale === "fr") return lightStem(token, "fr");
		return token;
	}

	return {
		id: "text-analysis",

		init(_indexes: Record<string, IndexSchema>) {},

		beforeQuery(ctx) {
			let q = ctx.query.q ?? ctx.query.term ?? "";
			if (!q.trim()) return;

			if (options.analyze) {
				ctx.query.q = options.analyze(q, ctx.query.locale ?? "en");
				return;
			}

			if (doNormalize) {
				q = foldDiacritics(q).toLowerCase();
			}

			if (doDetect && !ctx.query.locale) {
				ctx.query.locale = detectLang(q);
			}

			const locale = ctx.query.locale ?? "en";

			if (stemmerType !== "none") {
				q = q
					.split(/\s+/)
					.map((t) => stemToken(t, locale))
					.join(" ");
			}

			ctx.query.q = q;
			ctx.meta.textAnalysisLocale = locale;
		},
	};
}
