class Screenshoter {
  coordinate;
  screenHeight;
  tabId;
  constructor(coordinate, screenHeight, tabId) {
    this.coordinate = coordinate;
    this.screenHeight = screenHeight;
    this.tabId = tabId;
  }
  /** Capture the visible screen (with retry on error) */
  async captureVisibleScreen() {
    try {
      const img64Url = await chrome.tabs.captureVisibleTab({ format: "png" });
      return await (await fetch(img64Url)).blob();
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      return await this.captureVisibleScreen();
    }
  }
  /** Full-page screenshot using scroll stitching */
  async captureScreenshot() {
    let dy = 0;
    const cord = this.coordinate;
    let heightLeft = cord.height;
    const canvas = new OffscreenCanvas(cord.width, cord.height);
    const ctx = canvas.getContext("2d");
    if (!ctx)
      throw new Error("Cannot create 2D canvas context");
    this.tabId ??= (await getCrtTab()).id;
    while (heightLeft > 0) {
      const shotBlob = await this.captureVisibleScreen();
      const shotHeight = Math.min(this.screenHeight, heightLeft);
      const imageBitmap = await createImageBitmap(shotBlob, cord.x, 0, cord.width, shotHeight);
      ctx.drawImage(imageBitmap, 0, dy);
      imageBitmap.close();
      heightLeft -= shotHeight;
      dy += shotHeight;
      if (heightLeft > 0) {
        await chrome.tabs.sendMessage(this.tabId, { request: "scroll", top: shotHeight });
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
    return canvas.convertToBlob({ type: "image/png" });
  }
  /** Crop only the visible viewport */
  async captureViewportShot() {
    const cord = this.coordinate;
    const img64Url = await chrome.tabs.captureVisibleTab({ format: "png" });
    const shotBlob = await (await fetch(img64Url)).blob();
    if (!cord)
      return shotBlob;
    const imageBitmap = await createImageBitmap(shotBlob, cord.x, cord.y, cord.width, cord.height);
    const canvas = new OffscreenCanvas(cord.width, cord.height);
    const ctx = canvas.getContext("bitmaprenderer");
    if (!ctx)
      throw new Error("Cannot create bitmaprenderer context");
    ctx.transferFromImageBitmap(imageBitmap);
    imageBitmap.close();
    return await canvas.convertToBlob({ type: "image/png" });
  }
  /** Capture screenshot and return blobId + byte array */
  async captureAndUpload({ withinViewPort }) {
    try {
      const shotBlob = withinViewPort ? await this.captureViewportShot() : await this.captureScreenshot();
    } catch (error) {
      console.error(error);
    }
  }
}
export {
  Screenshoter
};
