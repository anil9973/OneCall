import { EngineToWidgetToolAction } from "../../shared/protocol.js";

export class ConversationStateAdapter {
	private sessionStartTime: number;
	private tabId: number;

	constructor(tabId: number) {
		this.tabId = tabId;
		this.sessionStartTime = Date.now();
	}

	startSession() {
		this.sessionStartTime = Date.now();
		this.sendUpdate({ callStatus: "connected", aiState: "listening" });
	}

	sendTranscript(role: "user" | "agent" | "system", text: string) {
		this.sendUpdate({
			transcriptMessage: {
				id: `msg_${Date.now()}`,
				role,
				content: text,
				timestamp: this.getDuration(),
			},
		});
	}

	sendStateChange(status: string) {
		const map: Record<string, string> = {
			connecting: "connecting",
			connected: "connected",
			disconnecting: "disconnecting",
			disconnected: "ended",
		};
		this.sendUpdate({ callStatus: map[status] || "idle" });
	}

	sendModeChange(mode: string) {
		this.sendUpdate({ aiState: mode }); // listening/speaking/thinking
	}

	private getDuration(): string {
		const elapsed = Date.now() - this.sessionStartTime;
		const mins = Math.floor(elapsed / 60000);
		const secs = Math.floor((elapsed % 60000) / 1000);
		return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
	}

	private sendUpdate(parameters: any) {
		chrome.tabs.sendMessage(this.tabId, {
			type: EngineToWidgetToolAction.UPDATE_UI_STATE,
			parameters,
		});
	}
}
