import { react, html } from "../../../lib/om.compact.js";
const states = {
  listening: "\u{1F3A7} Listening...",
  thinking: "\u{1F9E0} Processing...",
  acting: "\u26A1 Navigating...",
  speaking: "\u{1F5E3}\uFE0F Speaking..."
};
const statusMap = {
  idle: "idle",
  connecting: "connecting",
  connected: "connected",
  ended: "ended"
};
class CallHeader extends HTMLElement {
  state = react({
    callStatus: "connected",
    aiState: "listening"
  });
  constructor(state) {
    super();
  }
  handleClose(e) {
    this.dispatchEvent(new Event("hidewidget"));
  }
  handleSettings(e) {
    chrome.runtime.sendMessage({ type: "OPEN_SETTINGS" });
  }
  render() {
    return html`<i class=${() => statusMap[this.state.callStatus]}></i>
			<span class="header-title">${() => states[this.state.aiState] || "OneCall"}</span>

			<div class="header-actions">
				<button @click=${this.handleSettings.bind(this)} title="Settings">
					<svg class="settings" viewBox="0 0 24 24"><path /></svg>
				</button>
				<button @click=${this.handleClose.bind(this)} title="Close">
					<svg class="close" viewBox="0 0 24 24"><path /></svg>
				</button>
			</div>`;
  }
  connectedCallback(state) {
    this.state = state;
    this.replaceChildren(this.render());
  }
}
CallHeader = customElements.define("call-header", CallHeader);
export {
  CallHeader
};
