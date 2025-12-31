import { EngineToWidgetToolAction } from "../../shared/protocol.js";
class ConversationStateAdapter {
  sessionStartTime;
  tabId;
  constructor(tabId) {
    this.tabId = tabId;
    this.sessionStartTime = Date.now();
  }
  startSession() {
    this.sessionStartTime = Date.now();
    this.sendUpdate({ callStatus: "connected", aiState: "listening" });
  }
  sendTranscript(role, text) {
    this.sendUpdate({
      transcriptMessage: {
        id: `msg_${Date.now()}`,
        role,
        content: text,
        timestamp: this.getDuration()
      }
    });
  }
  sendStateChange(status) {
    const map = {
      connecting: "connecting",
      connected: "connected",
      disconnecting: "disconnecting",
      disconnected: "ended"
    };
    this.sendUpdate({ callStatus: map[status] || "idle" });
  }
  sendModeChange(mode) {
    this.sendUpdate({ aiState: mode });
  }
  getDuration() {
    const elapsed = Date.now() - this.sessionStartTime;
    const mins = Math.floor(elapsed / 6e4);
    const secs = Math.floor(elapsed % 6e4 / 1e3);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  sendUpdate(parameters) {
    chrome.tabs.sendMessage(this.tabId, {
      type: EngineToWidgetToolAction.UPDATE_UI_STATE,
      parameters
    });
  }
}
export {
  ConversationStateAdapter
};
