export class AudioWaveformAnalyzer {
	private audioContext: AudioContext;
	private analyser: AnalyserNode;
	private dataArray: Uint8Array;
	private animationId: number | null = null;
	private targetTabId: any;

	constructor(targetTabId: number, audioContext: AudioContext) {
		this.targetTabId = targetTabId;
		this.audioContext = audioContext;
		this.analyser = this.audioContext.createAnalyser();
		this.analyser.fftSize = 256;
		this.analyser.smoothingTimeConstant = 0.8;
		this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
	}

	async analyzeBuffer(audioBuffer: AudioBuffer) {
		// Connect to analyser
		const source = this.audioContext.createBufferSource();
		source.buffer = audioBuffer;
		source.connect(this.analyser);
		this.analyser.connect(this.audioContext.destination);

		// Start visualization
		if (!this.animationId) this.startVisualization();
	}

	private startVisualization() {
		const update = () => {
			//@ts-ignore
			this.analyser.getByteFrequencyData(this.dataArray);

			// Take 40 bars and normalize
			const waveform = Array.from(this.dataArray)
				.slice(0, 40)
				.map((value) => value / 255);

			// Send to content script
			chrome.runtime.sendMessage({
				type: "FORWARD_TO_TAB",
				tabId: this.targetTabId,
				tabMessage: {
					type: "UPDATE_UI_STATE",
					parameters: { waveform },
				},
			});

			this.animationId = requestAnimationFrame(update);
		};

		update();
	}

	stop() {
		if (this.animationId) {
			cancelAnimationFrame(this.animationId);
			this.animationId = null;
		}
		this.audioContext.close();
	}
}
