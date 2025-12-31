import { AudioWaveformAnalyzer } from "./audio-waveform-analyzer.js";
class AudioOutputManager {
  audioContext;
  analyzer;
  nextStartTime = 0;
  constructor(tabId) {
    this.audioContext = new AudioContext();
    this.analyzer = new AudioWaveformAnalyzer(tabId, this.audioContext);
  }
  async enqueueAudio(base64Audio) {
    try {
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const audioBuffer = await this.audioContext.decodeAudioData(bytes.buffer.slice(0));
      this.schedulePlayback(audioBuffer);
      this.analyzer.analyzeBuffer(audioBuffer);
    } catch (error) {
      console.error("[Audio] Decoding error:", error);
    }
  }
  schedulePlayback(buffer) {
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    const currentTime = this.audioContext.currentTime;
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
export {
  AudioOutputManager
};
