import { overLay } from "./crop-box.js";

export interface CropCoordinate {
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface CaptureResponse {
	blobId: string;
	blobArray: number[];
}

export interface CaptureResolvePayload {
	blobArray: number[];
}

export type CaptureResolve = (value: CaptureResolvePayload) => void;
export type CaptureReject = (reason?: any) => void;

/** Capture cropped screenshot + selected text */
export async function captureShot(resolve: CaptureResolve, reject: CaptureReject, ev: Event): Promise<void> {
	try {
		const currentTarget = ev.currentTarget as HTMLElement | null;
		const viewBox = overLay.firstElementChild as HTMLElement;
		const rect0 = viewBox.getBoundingClientRect();

		const screenHeight = innerHeight;
		const withinViewPort = rect0.height <= screenHeight;

		// Ensure cropper visible
		if (rect0.y < 0) viewBox.scrollIntoView();

		// Fix sticky elements while capturing
		if (!withinViewPort) {
			const header = document.querySelector("header");
			fixStickyPosition(header) || fixStickyPosition(header?.firstElementChild as HTMLElement | null);

			const nav = document.querySelector("nav");
			fixStickyPosition(nav) || fixStickyPosition(nav?.firstElementChild as HTMLElement | null);

			const aside = document.querySelector("aside");
			fixStickyPosition(aside) || fixStickyPosition(aside?.firstElementChild as HTMLElement | null);
		}

		// Compute final crop rect
		const rect = viewBox.getBoundingClientRect();
		const coordinate: CropCoordinate = {
			x: rect.x + 2,
			y: rect.y,
			width: rect.width - 2,
			height: rect.height,
		};

		overLay.hidden = true;
		await new Promise((r) => setTimeout(r, 5));

		// Listen for scroll updates
		function msgListener(message: any) {
			if (message?.request === "scroll") scrollBy({ top: message.top, behavior: "instant" });
		}

		chrome.runtime.onMessage.addListener(msgListener);

		const requestMsg = { type: "CAPTURE_SCREENSHOT", coordinate, screenHeight, withinViewPort };
		const response: CaptureResponse & { errCaused?: string } = await chrome.runtime.sendMessage(requestMsg);

		if (response.errCaused) {
			chrome.runtime.onMessage.removeListener(msgListener);
			return reject(response.errCaused);
		}

		resolve({ blobArray: response.blobArray });

		setTimeout(() => document.querySelector("shot-cropper")?.remove(), 8000);

		chrome.runtime.onMessage.removeListener(msgListener);
	} catch (error) {
		reject(error);
	}
}

function fixStickyPosition(elem: HTMLElement | null): boolean {
	if (!elem) return true;

	const styleMap = elem.computedStyleMap();
	const isStatic = styleMap.get("position")?.toString() === "static";
	isStatic || (elem.style.position = "static");
	return !isStatic;
}

function toast(msg: string, isErr = false): void {
	const snackbar = overLay.nextElementSibling as HTMLElement | null;
	if (!snackbar) return;

	snackbar.className = isErr ? "error" : "";
	snackbar.hidden = false;
	snackbar.textContent = msg;

	setTimeout(() => (snackbar.hidden = true), 5100);
}
