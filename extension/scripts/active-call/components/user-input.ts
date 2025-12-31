import { react, html, map } from "../../../lib/om.compact.js";
import type { UserInputRequest, IVROption } from "../types/index.js";

export class IVROptionList extends HTMLElement {
	keyPressListener: ((evt: KeyboardEvent) => void) | undefined;

	constructor(private ivrOptions: IVROption[]) {
		super();
	}

	handleOptionClick(number: number) {
		const detail = this.ivrOptions[number];
		if (!detail) return;
		this.dispatchEvent(new CustomEvent("onecall:ivr-select", { bubbles: true, composed: true, detail: detail }));
	}

	handleKeyDown(evt: KeyboardEvent) {
		const number = +evt.key;
		number && this.handleOptionClick(number);
	}

	render() {
		const item = (option: IVROption) => html`<li @click=${this.handleOptionClick.bind(this, option.number)}>
			<div class="option-coin">
				<div class="coin-inner">
					<span class="coin-number">${option.number}</span>
				</div>
			</div>
			<p class="option-text">${option.text}</p>
		</li>`;
		return html`${map(this.ivrOptions, item)}`;
	}

	connectedCallback(ivrOptions: IVROption[]) {
		this.ivrOptions = ivrOptions;
		this.replaceChildren(this.render());
		this.keyPressListener = this.handleKeyDown.bind(this);
		document.body.addEventListener("keyup", this.keyPressListener);
	}

	disconnectedCallback() {
		this.keyPressListener && document.body.removeEventListener("keyup", this.keyPressListener);
		this.remove();
	}
}

// @ts-ignore
IVROptionList = customElements.define("ivr-option-list", IVROptionList);

export class UserInput extends HTMLElement {
	keyPressListener: ((evt: KeyboardEvent) => void) | undefined;
	copyListener: (() => void) | undefined;
	userInputRequest!: UserInputRequest;
	inputField!: HTMLTextAreaElement;

	constructor(userInputRequest?: UserInputRequest) {
		super();
	}

	handleInputSubmit() {
		const detail = { requestId: this.userInputRequest.id, value: this.inputField.value };
		this.dispatchEvent(new CustomEvent("onecall:user-input", { bubbles: true, composed: true, detail: detail }));
	}

	handleKeyDown(evt: KeyboardEvent) {
		if ((evt.ctrlKey || evt.metaKey) && evt.code === "Enter") {
			evt.preventDefault();
			this.handleInputSubmit();
		}
	}

	onCopy() {
		const selection = getSelection();
		if (selection?.isCollapsed) return;

		const selectText = selection?.toString();
		this.inputField.value += selectText;
	}

	render() {
		return html`<label class="input-label">
				<span>${() => this.userInputRequest?.label || "Please enter:"}</span>
			</label>
			<textarea ref=${(node: HTMLTextAreaElement) => (this.inputField = node)} required></textarea>
			<svg class="done" viewBox="0 0 24 24" @click=${this.handleInputSubmit.bind(this)}>
				<title>Ctrl+Enter</title>
				<path />
			</svg>`;
	}

	connectedCallback(userInputRequest?: UserInputRequest) {
		userInputRequest && (this.userInputRequest = userInputRequest);
		this.replaceChildren(this.render());
		this.keyPressListener = this.handleKeyDown.bind(this);
		this.copyListener = this.onCopy.bind(this);
		document.body.addEventListener("keyup", this.keyPressListener);
		document.body.addEventListener("copy", this.copyListener);
	}

	disconnectedCallback() {
		this.keyPressListener && document.body.removeEventListener("keyup", this.keyPressListener);
		this.copyListener && document.body.removeEventListener("copy", this.copyListener);
		this.remove();
	}
}

// @ts-ignore
UserInput = customElements.define("user-input", UserInput);
