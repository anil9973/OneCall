import type { AIState, WidgetState } from "../types/index.js";
import { html } from "../../../lib/om.compact.js";

type ControlState = {
	isMuted: boolean;
	volume: number;
	showVolumeSlider: boolean;
	aiState: AIState;
	callStatus: string;
};

export class CallControls extends HTMLElement {
	state!: ControlState;

	constructor(state: WidgetState) {
		super();
	}

	async toggleMute(e: Event) {
		await chrome.runtime.sendMessage({ type: "TOGGLE_MIC_MUTE" });
		this.state.isMuted = !this.state.isMuted;
	}

	async handleHangup(e: Event) {
		await chrome.runtime.sendMessage({ type: "END_CALL" });
		this.state.callStatus = "ended";
	}

	async handleStop(e: Event) {
		/* TODO: await chrome.runtime.sendMessage({ type: "" });
		this.state.aiState = "listening"; */
	}

	handleVolumeToggle(e: Event) {
		this.state.showVolumeSlider = !this.state.showVolumeSlider;
	}

	async handleVolumeChange(evt: Event) {
		await chrome.runtime.sendMessage({ type: "UPDATE_VOLUME" });
		//@ts-ignore
		this.state.volume = evt.target.value;
	}

	render() {
		return html`<button @click=${this.toggleMute.bind(this)}>
				<svg class=${() => (this.state.isMuted ? "mute" : "mic")} viewBox="0 0 16 16">
					<path />
				</svg>
			</button>

			<button title="Hang up" style="background:red" @click=${this.handleHangup.bind(this)}>
				<svg viewBox="0 0 48 48">
					<path
						fill="currentColor"
						d="m43.5 16.8l-2.3-2.3c-8.1-7.9-27.5-6.8-34.5 0l-2.3 2.3c-.6.6-.6 1.6 0 2.3L9 23.6c.6.6 1.7.6 2.3 0l5.1-4.9l-.4-5.3c1.6-1.6 14.4-1.6 16 0l-.3 5.5l4.9 4.7c.6.6 1.7.6 2.3 0l4.6-4.5c.7-.7.7-1.7 0-2.3" />
					<g fill="currentColor">
						<path d="M24 40.5L16 31h16z" />
						<path d="M21 24h6v7.5h-6z" />
					</g>
				</svg>
			</button>

			${() =>
				this.state.aiState === "acting"
					? html`<button class="control-btn stop-btn" @click=${this.handleStop.bind(this)} title="Stop AI action">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
								<path fill="currentColor" d="M6,6H18V18H6V6Z" />
							</svg>
							<span class="btn-label">Stop</span>
					  </button> `
					: html`<div class="volume-control">
							<button @click=${this.handleVolumeToggle.bind(this)} title="Volume">
								<svg viewBox="0 0 24 24">
									<path
										fill="currentColor"
										d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z" />
								</svg>
							</button>
							<div class="volume-slider" ?hidden=${() => !this.state.showVolumeSlider}>
								<input
									type="range"
									min="0"
									max="100"
									.value=${() => this.state.volume}
									@input=${this.handleVolumeChange.bind(this)}
									orient="vertical" />
							</div>
					  </div> `} `;
	}

	connectedCallback(state: ControlState) {
		this.state = state;
		this.replaceChildren(this.render());
	}
}

// @ts-ignore
CallControls = customElements.define("call-controls", CallControls);
