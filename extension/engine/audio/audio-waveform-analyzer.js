class AudioWaveformAnalyzer {
  audioContext;
  analyser;
  dataArray;
  animationId = null;
  targetTabId;
  constructor(targetTabId, audioContext) {
    this.targetTabId = targetTabId;
    this.audioContext = audioContext;
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.8;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
  }
  async analyzeBuffer(audioBuffer) {
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
    if (!this.animationId) this.startVisualization();
  }
  startVisualization() {
    const update = () => {
      this.analyser.getByteFrequencyData(this.dataArray);
      const waveform = Array.from(this.dataArray).slice(0, 40).map((value) => value / 255);
      chrome.runtime.sendMessage({
        type: "FORWARD_TO_TAB",
        tabId: this.targetTabId,
        tabMessage: {
          type: "UPDATE_UI_STATE",
          parameters: { waveform }
        }
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
export {
  AudioWaveformAnalyzer
};
