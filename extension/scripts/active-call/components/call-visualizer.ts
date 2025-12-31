import { html } from "../../../lib/om.compact.js";

export class CallVisualizer extends HTMLElement {
	state: any;

	constructor(state: any) {
		super();
	}

	render() {
		return html`<mic-ring class=${() => this.state.aiState} state="listening">
				<div class="coin-ring">
					<svg class="mic" viewBox="0 0 16 16">
						<path />
					</svg>
				</div>
			</mic-ring>

			<waveform-container class=${() => this.state.aiState}>
				<div class="bar"></div>
				<div class="bar"></div>
				<div class="bar"></div>
				<div class="bar"></div>
				<div class="bar"></div>
			</waveform-container>`;
	}

	connectedCallback(state: any) {
		this.state = state;
		this.replaceChildren(this.render());
	}
}

// @ts-ignore
CallVisualizer = customElements.define("call-visualizer", CallVisualizer);
