export interface CropCoordinate {
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface CaptureOptions {
	withinViewPort: boolean;
}

declare function getCrtTab(): Promise<{ id: number }>;

export class Screenshoter {
	private coordinate: CropCoordinate;
	private screenHeight: number;
	private tabId: number;

	constructor(coordinate: CropCoordinate, screenHeight: number, tabId: number) {
		this.coordinate = coordinate;
		this.screenHeight = screenHeight;
		this.tabId = tabId;
	}

	/** Capture the visible screen (with retry on error) */
	async captureVisibleScreen(): Promise<Blob> {
		try {
			const img64Url = await chrome.tabs.captureVisibleTab({ format: "png" });
			return await (await fetch(img64Url)).blob();
		} catch {
			// Wait 1 sec then retry
			await new Promise((resolve) => setTimeout(resolve, 1000));
			return await this.captureVisibleScreen();
		}
	}

	/** Full-page screenshot using scroll stitching */
	async captureScreenshot(): Promise<Blob> {
		let dy = 0;
		const cord = this.coordinate;
		let heightLeft = cord.height;

		const canvas = new OffscreenCanvas(cord.width, cord.height);
		const ctx = canvas.getContext("2d");
		if (!ctx) throw new Error("Cannot create 2D canvas context");

		this.tabId ??= (await getCrtTab()).id;

		while (heightLeft > 0) {
			const shotBlob = await this.captureVisibleScreen();
			const shotHeight = Math.min(this.screenHeight, heightLeft);

			// Crop from the visible screen
			const imageBitmap = await createImageBitmap(shotBlob, cord.x, 0, cord.width, shotHeight);
			ctx.drawImage(imageBitmap, 0, dy);
			imageBitmap.close();

			// Scroll down
			heightLeft -= shotHeight;
			dy += shotHeight;

			if (heightLeft > 0) {
				await chrome.tabs.sendMessage(this.tabId!, { request: "scroll", top: shotHeight });
				await new Promise((resolve) => setTimeout(resolve, 100));
			}
		}

		return canvas.convertToBlob({ type: "image/png" });
	}

	/** Crop only the visible viewport */
	async captureViewportShot(): Promise<Blob> {
		const cord = this.coordinate;
		const img64Url = await chrome.tabs.captureVisibleTab({ format: "png" });
		const shotBlob = await (await fetch(img64Url)).blob();

		// If no coordinate, return original blob
		if (!cord) return shotBlob;

		const imageBitmap = await createImageBitmap(shotBlob, cord.x, cord.y, cord.width, cord.height);

		const canvas = new OffscreenCanvas(cord.width, cord.height);
		const ctx = canvas.getContext("bitmaprenderer");
		if (!ctx) throw new Error("Cannot create bitmaprenderer context");

		ctx.transferFromImageBitmap(imageBitmap);
		imageBitmap.close();

		return await canvas.convertToBlob({ type: "image/png" });
	}

	/** Capture screenshot and return blobId + byte array */
	async captureAndUpload({ withinViewPort }: CaptureOptions) {
		try {
			const shotBlob = withinViewPort ? await this.captureViewportShot() : await this.captureScreenshot();
			//TODO handle screenshot blob
		} catch (error) {
			console.error(error);
		}
	}
}
