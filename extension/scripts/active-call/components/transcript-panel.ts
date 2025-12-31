import { html, map } from "../../../lib/om.compact.js";
import type { Message } from "../types/index.js";

export class TranscriptPanel extends HTMLElement {
	messages: Message[] = [];

	constructor(messages: Message[]) {
		super();
	}

	render() {
		const item = (message: Message) => html`<message-card> <p>${message.content}</p></message-card>`;
		return html`<details ?hidden=${() => this.messages.length === 0}>
			<summary>
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
					<path
						d="M5 16a1 1 0 0 1 1-1h8a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1m13-5a1 1 0 1 1 0 2h-8a1 1 0 1 1 0-2zm-2 5a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2h-1a1 1 0 0 1-1-1m-9-5a1 1 0 1 1 0 2H6a1 1 0 1 1 0-2z" />
					<path
						fill-rule="evenodd"
						d="M4 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h16a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3zm16 2H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1"
						clip-rule="evenodd" />
				</svg>
				<span class="header-title">Transcript</span>
				<svg class="chev-down">
					<path />
				</svg>
			</summary>
			<ul class="transcript-messages">
				${map(this.messages, item)}
			</ul>
		</details>`;
	}

	connectedCallback(messages: Message[]) {
		this.messages = messages;
		this.replaceChildren(this.render());
	}
}

// @ts-ignore
TranscriptPanel = customElements.define("transcript-panel", TranscriptPanel);
