import { html, map } from "../../../lib/om.compact.js";
class IVROptionList extends HTMLElement {
  constructor(ivrOptions) {
    super();
    this.ivrOptions = ivrOptions;
  }
  keyPressListener;
  handleOptionClick(number) {
    const detail = this.ivrOptions[number];
    if (!detail)
      return;
    this.dispatchEvent(new CustomEvent("onecall:ivr-select", { bubbles: true, composed: true, detail }));
  }
  handleKeyDown(evt) {
    const number = +evt.key;
    number && this.handleOptionClick(number);
  }
  render() {
    const item = (option) => html`<li @click=${this.handleOptionClick.bind(this, option.number)}>
			<div class="option-coin">
				<div class="coin-inner">
					<span class="coin-number">${option.number}</span>
				</div>
			</div>
			<p class="option-text">${option.text}</p>
		</li>`;
    return html`${map(this.ivrOptions, item)}`;
  }
  connectedCallback(ivrOptions) {
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
IVROptionList = customElements.define("ivr-option-list", IVROptionList);
class UserInput extends HTMLElement {
  keyPressListener;
  copyListener;
  userInputRequest;
  inputField;
  constructor(userInputRequest) {
    super();
  }
  handleInputSubmit() {
    const detail = { requestId: this.userInputRequest.id, value: this.inputField.value };
    this.dispatchEvent(new CustomEvent("onecall:user-input", { bubbles: true, composed: true, detail }));
  }
  handleKeyDown(evt) {
    if ((evt.ctrlKey || evt.metaKey) && evt.code === "Enter") {
      evt.preventDefault();
      this.handleInputSubmit();
    }
  }
  onCopy() {
    const selection = getSelection();
    if (selection?.isCollapsed)
      return;
    const selectText = selection?.toString();
    this.inputField.value += selectText;
  }
  render() {
    return html`<label class="input-label">
				<span>${() => this.userInputRequest?.label || "Please enter:"}</span>
			</label>
			<textarea ref=${(node) => this.inputField = node} required></textarea>
			<svg class="done" viewBox="0 0 24 24" @click=${this.handleInputSubmit.bind(this)}>
				<title>Ctrl+Enter</title>
				<path />
			</svg>`;
  }
  connectedCallback(userInputRequest) {
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
UserInput = customElements.define("user-input", UserInput);
export {
  IVROptionList,
  UserInput
};
