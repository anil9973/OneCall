export class VisualTools {
	private mediaRecorder: MediaRecorder | null = null;
	private recordedChunks: Blob[] = [];
	private selectorOverlay: HTMLElement | null = null;

	/** Take screenshot with sensitive data blurred */
	async takeScreenshot(params: { blurSensitive?: boolean; fullPage?: boolean }) {
		const { blurSensitive = true, fullPage = false } = params;

		try {
			// Hide OneCall widget before screenshot
			const widget = document.querySelector("onecall-widget");
			if (widget && widget instanceof HTMLElement) widget.hidePopover();

			// Blur sensitive fields if needed
			const sensitiveElements: HTMLElement[] = [];
			if (blurSensitive) {
				const patterns = [
					'input[type="password"]',
					'input[autocomplete*="cc-"]',
					'input[name*="cvv"]',
					'input[name*="ssn"]',
					"[data-sensitive]",
				];

				patterns.forEach((pattern) => {
					document.querySelectorAll(pattern).forEach((el) => {
						const htmlEl = el as HTMLElement;
						htmlEl.style.filter = "blur(10px)";
						sensitiveElements.push(htmlEl);
					});
				});
			}

			const { createCropUI } = await import(chrome.runtime.getURL("/scripts/screenshot/crop-box.js"));
			const shotContent = await createCropUI();

			// Restore sensitive elements
			sensitiveElements.forEach((elem) => (elem.style.filter = ""));
			// Restore widget
			if (widget && widget instanceof HTMLElement) widget.showPopover();

			return { success: true, dataUrl: shotContent, format: "png" };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	/** Start screen recording */
	async startScreenRecording(params: { duration?: number; includeAudio?: boolean }) {
		const { duration = 30000, includeAudio = false } = params;

		try {
			// Hide widget during recording
			const widget = document.getElementById("onecall-widget") as any;
			if (widget && widget instanceof HTMLElement) widget.hidePopover();

			await import(chrome.runtime.getURL("/scripts/screenrecording/recording.js"));

			return { success: true, recording: true, duration };
		} catch (error) {
			console.error(error);
			return { success: false, error: String(error) };
		}
	}

	/** Start element selector (interactive click to select) */
	async startElementSelector(params: { callback?: string }) {
		try {
			this.createSelectorOverlay();

			return new Promise<any>((resolve) => {
				const handleClick = (e: MouseEvent) => {
					e.preventDefault();
					e.stopPropagation();

					const target = e.target as HTMLElement;
					const rect = target.getBoundingClientRect();

					this.removeSelectorOverlay();
					document.removeEventListener("click", handleClick, true);

					resolve({
						success: true,
						element: {
							tag: target.tagName.toLowerCase(),
							id: target.id || null,
							className: target.className || null,
							text: target.textContent?.trim().slice(0, 100),
							position: {
								top: rect.top,
								left: rect.left,
								width: rect.width,
								height: rect.height,
							},
						},
					});
				};

				document.addEventListener("click", handleClick, true);

				// Auto-cancel after 30 seconds
				setTimeout(() => {
					document.removeEventListener("click", handleClick, true);
					this.removeSelectorOverlay();
					resolve({ success: false, error: "Selector timeout" });
				}, 30000);
			});
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	/** Stop recording */
	stopRecording() {
		if (this.mediaRecorder?.state === "recording") this.mediaRecorder.stop();
	}

	/** Create selector overlay */
	private createSelectorOverlay() {
		this.removeSelectorOverlay();

		this.selectorOverlay = document.createElement("div");
		this.selectorOverlay.id = "onecall-selector-overlay";

		Object.assign(this.selectorOverlay.style, {
			position: "fixed",
			top: "0",
			left: "0",
			width: "100%",
			height: "100%",
			backgroundColor: "rgba(0, 0, 0, 0.3)",
			cursor: "crosshair",
			zIndex: "999998",
		});

		const instruction = document.createElement("div");
		Object.assign(instruction.style, {
			position: "fixed",
			top: "20px",
			left: "50%",
			transform: "translateX(-50%)",
			padding: "12px 24px",
			backgroundColor: "#FF6B35",
			color: "white",
			borderRadius: "8px",
			fontFamily: "system-ui, sans-serif",
			fontSize: "14px",
			fontWeight: "500",
			zIndex: "999999",
		});
		instruction.textContent = "Click on any element to select it";

		document.body.appendChild(this.selectorOverlay);
		document.body.appendChild(instruction);
	}

	/** Remove selector overlay */
	private removeSelectorOverlay() {
		this.selectorOverlay?.remove();
		document.querySelectorAll("#onecall-selector-overlay + div").forEach((el) => el.remove());
		this.selectorOverlay = null;
	}

	/** Convert blob to data URL */
	private async blobToDataUrl(blob: Blob): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(reader.result as string);
			reader.onerror = reject;
			reader.readAsDataURL(blob);
		});
	}
}
