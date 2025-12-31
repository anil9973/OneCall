import { AudioWaveformAnalyzer } from "./audio-waveform-analyzer.js";

export class AudioOutputManager {
	public readonly audioContext: AudioContext;
	public readonly analyzer: AudioWaveformAnalyzer;

	private nextStartTime = 0;

	constructor(tabId: number) {
		this.audioContext = new AudioContext();
		this.analyzer = new AudioWaveformAnalyzer(tabId, this.audioContext);
	}

	async enqueueAudio(base64Audio: string) {
		try {
			// 1. Decode Base64 to ArrayBuffer
			const binaryString = atob(base64Audio);
			const bytes = new Uint8Array(binaryString.length);
			for (let i = 0; i < binaryString.length; i++) {
				bytes[i] = binaryString.charCodeAt(i);
			}

			// 2. Decode Audio Data (Async)
			// Clone buffer because decodeAudioData detaches it
			const audioBuffer = await this.audioContext.decodeAudioData(bytes.buffer.slice(0));

			// 3. Schedule & Analyze
			this.schedulePlayback(audioBuffer);
			this.analyzer.analyzeBuffer(audioBuffer);
		} catch (error) {
			console.error("[Audio] Decoding error:", error);
		}
	}

	private schedulePlayback(buffer: AudioBuffer) {
		const source = this.audioContext.createBufferSource();
		source.buffer = buffer;
		source.connect(this.audioContext.destination);

		const currentTime = this.audioContext.currentTime;
		// Ensure we don't schedule in the past
		if (this.nextStartTime < currentTime) {
			this.nextStartTime = currentTime;
		}

		source.start(this.nextStartTime);
		this.nextStartTime += buffer.duration;
	}

	suspend() {
		return this.audioContext.suspend();
	}

	resume() {
		return this.audioContext.resume();
	}

	close() {
		this.analyzer.stop();
		return this.audioContext.close();
	}
}
