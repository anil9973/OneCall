interface UIState {
	callStatus?: "idle" | "connecting" | "connected" | "ended";
	aiState?: "listening" | "thinking" | "acting" | "speaking";
	currentPage?: string;
	ivrOptions?: Array<{ id: string; number: number; text: string }>;
	userInputRequest?: {
		id: string;
		type: "text" | "number" | "otp";
		label: string;
		placeholder: string;
		maxLength?: number;
	} | null;
	transcriptMessages?: Array<{ id: string; role: "user" | "ai"; content: string; timestamp: number }>;
}

export class UITools {
	/** Update OneCall widget UI state */
	async updateUIState(params: UIState) {
		try {
			const widget = document.getElementById("onecall-widget") as any;
			if (!widget) return { success: false, error: "Widget not found" };

			// Update widget state properties
			if (widget.state) Object.assign(widget.state, params);

			return { success: true, updated: Object.keys(params) };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	/** Request user input via widget */
	async requestUserInput(params: {
		type: "text" | "number" | "otp";
		label: string;
		placeholder?: string;
		maxLength?: number;
	}) {
		const { type, label, placeholder = "", maxLength } = params;

		try {
			const widget = document.getElementById("onecall-widget") as any;
			if (!widget) return { success: false, error: "Widget not found" };

			const requestId = `input_${Date.now()}`;
			if (widget.state) widget.state.userInputRequest = { id: requestId, type, label, placeholder, maxLength };

			// Listen for user response
			return new Promise((resolve) => {
				const handleResponse = (event: CustomEvent) => {
					if (event.detail.requestId === requestId) {
						document.removeEventListener("onecall:user-input", handleResponse as any);
						widget.state.userInputRequest = null;
						resolve({ success: true, value: event.detail.value, requestId });
					}
				};

				document.addEventListener("onecall:user-input", handleResponse as any);

				// Timeout after 100 seconds
				setTimeout(() => {
					document.removeEventListener("onecall:user-input", handleResponse as any);
					resolve({ success: false, error: "Input timeout" });
				}, 100000);
			});
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	/** Display IVR options in widget */
	async displayIVROptions(params: { options: Array<{ number: number; text: string }> }) {
		const { options } = params;

		try {
			const widget = document.getElementById("onecall-widget") as any;
			if (!widget) return { success: false, error: "Widget not found" };

			widget.state && (widget.state.ivrOptions = options.map((opt) => ({ number: opt.number, text: opt.text })));

			// Listen for user response
			return new Promise((resolve) => {
				const handleResponse = (event: CustomEvent) => {
					document.removeEventListener("onecall:ivr-select", handleResponse as any);
					widget.state.ivrOptions = null;
					resolve({ success: true, value: event.detail.value });
				};

				document.addEventListener("onecall:ivr-select", handleResponse as any);

				// Timeout after 100 seconds
				setTimeout(() => {
					document.removeEventListener("onecall:ivr-select", handleResponse as any);
					resolve({ success: false, error: "Ivr Option timeout" });
				}, 100000);
			});
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	/** Add message to transcript */
	async addTranscriptMessage(params: { role: "user" | "ai"; content: string }) {
		const { role, content } = params;

		try {
			const widget = document.getElementById("onecall-widget") as any;
			if (!widget) return { success: false, error: "Widget not found" };

			if (widget.state?.transcriptMessage) {
				widget.state.transcriptMessages.push({
					id: `msg_${Date.now()}`,
					role,
					content,
					timestamp: Date.now(),
				});
			}

			return { success: true, messageAdded: true };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}
}
