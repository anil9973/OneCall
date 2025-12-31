class VisualTools {
  mediaRecorder = null;
  recordedChunks = [];
  selectorOverlay = null;
  /** Take screenshot with sensitive data blurred */
  async takeScreenshot(params) {
    const { blurSensitive = true, fullPage = false } = params;
    try {
      const widget = document.querySelector("onecall-widget");
      if (widget && widget instanceof HTMLElement)
        widget.hidePopover();
      const sensitiveElements = [];
      if (blurSensitive) {
        const patterns = [
          'input[type="password"]',
          'input[autocomplete*="cc-"]',
          'input[name*="cvv"]',
          'input[name*="ssn"]',
          "[data-sensitive]"
        ];
        patterns.forEach((pattern) => {
          document.querySelectorAll(pattern).forEach((el) => {
            const htmlEl = el;
            htmlEl.style.filter = "blur(10px)";
            sensitiveElements.push(htmlEl);
          });
        });
      }
      const { createCropUI } = await import(chrome.runtime.getURL("/scripts/screenshot/crop-box.js"));
      const shotContent = await createCropUI();
      sensitiveElements.forEach((elem) => elem.style.filter = "");
      if (widget && widget instanceof HTMLElement)
        widget.showPopover();
      return { success: true, dataUrl: shotContent, format: "png" };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
  /** Start screen recording */
  async startScreenRecording(params) {
    const { duration = 3e4, includeAudio = false } = params;
    try {
      const widget = document.getElementById("onecall-widget");
      if (widget && widget instanceof HTMLElement)
        widget.hidePopover();
      await import(chrome.runtime.getURL("/scripts/screenrecording/recording.js"));
      return { success: true, recording: true, duration };
    } catch (error) {
      console.error(error);
      return { success: false, error: String(error) };
    }
  }
  /** Start element selector (interactive click to select) */
  async startElementSelector(params) {
    try {
      this.createSelectorOverlay();
      return new Promise((resolve) => {
        const handleClick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          const target = e.target;
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
                height: rect.height
              }
            }
          });
        };
        document.addEventListener("click", handleClick, true);
        setTimeout(() => {
          document.removeEventListener("click", handleClick, true);
          this.removeSelectorOverlay();
          resolve({ success: false, error: "Selector timeout" });
        }, 3e4);
      });
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
  /** Stop recording */
  stopRecording() {
    if (this.mediaRecorder?.state === "recording")
      this.mediaRecorder.stop();
  }
  /** Create selector overlay */
  createSelectorOverlay() {
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
      zIndex: "999998"
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
      zIndex: "999999"
    });
    instruction.textContent = "Click on any element to select it";
    document.body.appendChild(this.selectorOverlay);
    document.body.appendChild(instruction);
  }
  /** Remove selector overlay */
  removeSelectorOverlay() {
    this.selectorOverlay?.remove();
    document.querySelectorAll("#onecall-selector-overlay + div").forEach((el) => el.remove());
    this.selectorOverlay = null;
  }
  /** Convert blob to data URL */
  async blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
export {
  VisualTools
};
