import icons from "/assets/icons.json" with { type: "json" };
class AtomIcon extends HTMLElement {
  _internals;
  constructor(ico) {
    super();
    if (ico) {
      this.setAttribute("ico", ico);
    }
  }
  get checked() {
    return this._internals?.states.has("checked") ?? false;
  }
  set checked(flag) {
    if (!this._internals) return;
    flag ? this._internals.states.add("checked") : this._internals.states.delete("checked");
  }
  set ico(newIcon) {
    const svg = this.firstElementChild;
    svg && (svg.innerHTML = icons[newIcon] ?? "");
  }
  render(path) {
    return `<svg viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg">
				${path ? icons[path] ?? "" : ""}
			</svg>`;
  }
  connectedCallback() {
    this.innerHTML = this.render(this.getAttribute("ico"));
    if (this.hasAttribute("toggle")) {
      this._internals = this.attachInternals();
      this.addEventListener("click", this.#onClick.bind(this));
    }
  }
  #onClick() {
    this.checked = !this.checked;
    this.dispatchEvent(new Event("change"));
  }
}
customElements?.define("atom-icon", AtomIcon);
export {
  AtomIcon
};
