import { html } from "../../../lib/om.compact.js";
class CallVisualizer extends HTMLElement {
  state;
  constructor(state) {
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
  connectedCallback(state) {
    this.state = state;
    this.replaceChildren(this.render());
  }
}
CallVisualizer = customElements.define("call-visualizer", CallVisualizer);
export {
  CallVisualizer
};
