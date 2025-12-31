import { react, html } from "../../../lib/om.compact.js";
import type { CallStatus, AIState } from "../types/index.js";

type State = {
	callStatus: CallStatus;
	aiState: AIState;
};

const states = {
	listening: "🎧 Listening...",
	thinking: "🧠 Processing...",
	acting: "⚡ Navigating...",
	speaking: "🗣️ Speaking...",
};

const statusMap = {
	idle: "idle",
	connecting: "connecting",
	connected: "connected",
	ended: "ended",
};

export class CallHeader extends HTMLElement {
	state = react<State>({
		callStatus: "connected" as CallStatus,
		aiState: "listening" as AIState,
	});

	constructor(state: State) {
		super();
	}

	handleClose(e: Event) {
		this.dispatchEvent(new Event("hidewidget"));
	}

	handleSettings(e: Event) {
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

	connectedCallback(state: State) {
		this.state = state;
		this.replaceChildren(this.render());
	}
}

//@ts-ignore
CallHeader = customElements.define("call-header", CallHeader);
