import { react, html } from "../../../lib/om.compact.js";

export class UnofficialBadge extends HTMLElement {
	render() {
		return html`<details class="unofficial-badge">
                <summary>
                    <svg class="warn" viewBox="0 0 24 24">
                       <title>know more</title>
                        <path />
                    </svg>
                    <span class="title">UNOFFICIAL ASSISTANT MODE</span>
                    <svg class="chev-down" viewBox="0 0 24 24">
                        <title>know more</title>
                        <path />
                    </svg>
                </summary>
                <div class="badge-content">
                   	<p class="badge-description">
							This assistant is not authorized by the website owner. 
							Some actions may be restricted.
						</p>
						<button class="owner-link">
							Are you the website owner? 
							<span class="link-arrow">→</span>
						</button>
					</div>
                </div>
            </details>`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
		setTimeout(() => this.firstElementChild?.firstElementChild?.classList.add("collapsed"), 5000);
	}
}

//@ts-ignore
UnofficialBadge = customElements.define("unofficial-badge", UnofficialBadge);
