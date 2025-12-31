import icons from "/assets/icons.json" with { type: "json" };

export class AtomIcon extends HTMLElement {
	private _internals!: ElementInternals;

	constructor(ico?: string) {
		super();
		if (ico) {
			this.setAttribute("ico", ico);
		}
	}

	get checked(): boolean {
		return this._internals?.states.has("checked") ?? false;
	}

	set checked(flag: boolean) {
		if (!this._internals) return;
		flag ? this._internals.states.add("checked") : this._internals.states.delete("checked");
	}

	set ico(newIcon: string) {
		const svg = this.firstElementChild as SVGElement | null;
		svg &&(	svg.innerHTML = icons[newIcon] ?? "");
	}

	private render(path: string | null): string {
		return `<svg viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg">
				${path ? icons[path] ?? "" : ""}
			</svg>`;
	}

	connectedCallback(): void {
		this.innerHTML = this.render(this.getAttribute("ico"));

		if (this.hasAttribute("toggle")) {
			this._internals = this.attachInternals();
			this.addEventListener("click", this.#onClick.bind(this));
		}
	}

	#onClick(): void {
		this.checked = !this.checked;
		this.dispatchEvent(new Event("change"));
	}
}

customElements?.define("atom-icon", AtomIcon);

