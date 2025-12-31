import type { VoiceInfo, VoiceFilterCriteria } from "../types/index.ts";

/** Dynamic voice selection from ElevenLabs API */
export class VoiceSelector {
	private voices: VoiceInfo[] = [];
	private lastFetch = 0;
	private readonly cacheDuration = 3600000; // 1 hour
	private apiKey: string;

	constructor(apiKey: string) {
		this.apiKey = apiKey;
	}

	/** Fetch available voices from ElevenLabs */
	async fetchVoices(): Promise<VoiceInfo[]> {
		const now = Date.now();
		if (this.voices.length > 0 && now - this.lastFetch < this.cacheDuration) return this.voices;

		const headers = new Headers({ "xi-api-key": this.apiKey });
		const response = await fetch("https://api.elevenlabs.io/v1/voices", { headers });
		if (!response.ok) throw new Error("Failed to fetch voices");

		const data = await response.json();
		this.voices = data.voices;
		this.lastFetch = now;

		return this.voices;
	}

	/** Select voice based on criteria */
	async select(criteria: VoiceFilterCriteria = {}): Promise<VoiceInfo> {
		const voices = await this.fetchVoices();

		const filtered = voices.filter((voice) => {
			const labels = voice.labels || {};

			if (criteria.gender && labels.gender?.toLowerCase() !== criteria.gender) return false;
			if (criteria.age && labels.age?.toLowerCase() !== criteria.age) return false;
			if (criteria.accent && labels.accent?.toLowerCase() !== criteria.accent) return false;
			if (criteria.useCase && labels.use_case?.toLowerCase() !== criteria.useCase) return false;

			return true;
		});

		return filtered[0] ?? voices[0];
	}

	/** Get voice by ID */
	async getById(voiceId: string): Promise<VoiceInfo | null> {
		const voices = await this.fetchVoices();
		return voices.find((v) => v.voice_id === voiceId) ?? null;
	}

	/** Get all conversational voices */
	async getConversational(): Promise<VoiceInfo[]> {
		const voices = await this.fetchVoices();
		return voices.filter((v) => v.labels?.use_case === "conversational");
	}
}
