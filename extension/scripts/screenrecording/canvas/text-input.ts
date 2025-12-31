export class TextInputOverlay {
	private textarea: HTMLTextAreaElement | null = null;
	private callback: ((text: string) => void) | null = null;

	constructor() {}

	show(x: number, y: number, callback: (text: string) => void): void {
		this.hide(); // Remove existing if any

		this.callback = callback;
		this.textarea = document.createElement("textarea");

		Object.assign(this.textarea.style, {
			position: "absolute",
			left: `${x}px`,
			top: `${y}px`,
			minWidth: "200px",
			minHeight: "40px",
			padding: "8px",
			fontSize: "16px",
			fontFamily: "sans-serif",
			border: "2px solid #4A90E2",
			borderRadius: "4px",
			outline: "none",
			background: "rgba(255, 255, 255, 0.95)",
			color: "#333",
			resize: "both",
			zIndex: "10001",
			boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
		});

		this.textarea.placeholder = "Type text... (Enter to confirm, Esc to cancel)";
		this.textarea.addEventListener("keydown", this.handleKeyDown);
		this.textarea.addEventListener("blur", this.handleBlur);

		document.body.appendChild(this.textarea);
		this.textarea.focus();
	}

	hide(): void {
		if (this.textarea) {
			this.textarea.removeEventListener("keydown", this.handleKeyDown);
			this.textarea.removeEventListener("blur", this.handleBlur);
			this.textarea.remove();
			this.textarea = null;
			this.callback = null;
		}
	}

	private handleKeyDown = (e: KeyboardEvent): void => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			this.commit();
		} else if (e.key === "Escape") {
			e.preventDefault();
			this.hide();
		}
	};

	private handleBlur = (): void => {
		// Delay to allow click events to process
		setTimeout(() => this.commit(), 100);
	};

	private commit(): void {
		if (this.textarea && this.callback) {
			const text = this.textarea.value.trim();
			if (text) this.callback(text);
		}
		this.hide();
	}
}
