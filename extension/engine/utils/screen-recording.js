class ScreenRecorder {
  mediaRecorder = null;
  recordedChunks = [];
  stream = null;
  mimeType = "video/webm";
  constructor() {
  }
  async start() {
    this.stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    this.recordedChunks = [];
    this.mediaRecorder = new MediaRecorder(this.stream, { mimeType: this.mimeType });
    this.mediaRecorder.ondataavailable = (e) => e.data.size > 0 && this.recordedChunks.push(e.data);
    this.mediaRecorder.onstop = () => this.handleStop().catch(console.error);
    this.mediaRecorder.start();
  }
  stop() {
    if (this.mediaRecorder?.state !== "inactive")
      this.mediaRecorder.stop();
    this.stream?.getTracks().forEach((track) => track.stop());
  }
  async handleStop() {
    const blob = new Blob(this.recordedChunks, {
      type: this.mimeType
    });
  }
}
export {
  ScreenRecorder
};
