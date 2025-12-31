export class ScreenRecorder {
	private mediaRecorder: MediaRecorder | null = null;
	private recordedChunks: Blob[] = [];
	private stream: MediaStream | null = null;
	private readonly mimeType: string = "video/webm";

	constructor() {}

	async start(): Promise<void> {
		this.stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
		this.recordedChunks = [];
		this.mediaRecorder = new MediaRecorder(this.stream, { mimeType: this.mimeType });

		this.mediaRecorder.ondataavailable = (e: BlobEvent) => e.data.size > 0 && this.recordedChunks.push(e.data);

		this.mediaRecorder.onstop = () => this.handleStop().catch(console.error);
		this.mediaRecorder.start();
	}

	stop(): void {
		if (this.mediaRecorder?.state !== "inactive") this.mediaRecorder!.stop();

		// stop screen capture tracks
		this.stream?.getTracks().forEach((track) => track.stop());
	}

	private async handleStop(): Promise<void> {
		const blob = new Blob(this.recordedChunks, {
			type: this.mimeType,
		});

		//TODO handled blob
	}
}
