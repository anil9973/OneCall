class InteractionTools {
  domExtractor;
  constructor(domExtractor) {
    this.domExtractor = domExtractor;
  }
  /** Get interactive elements (buttons, links, inputs) */
  async getInteractiveElements(params) {
    const { type = "all" } = params;
    const stepType = type === "all" ? "generic" : type;
    const elements = await this.domExtractor.extractInteractiveElements(stepType);
    return {
      elements: elements.slice(0, 100),
      count: elements.length,
      type
    };
  }
  async findElement(params) {
    const { eId, indexPath } = params;
    const element = eId ? this.domExtractor.getElementByEId(eId) : indexPath ? this.domExtractor.getElementByIndexPath(indexPath) : null;
    if (!element)
      return void 0;
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    await new Promise((resolve) => setTimeout(resolve, 300));
    return element;
  }
  /** Highlight element with pulsing animation */
  async highlightElement(params) {
    const element = await this.findElement(params);
    if (!element)
      return { success: false, error: "Element not found" };
    this.showGuidedAction(element);
    return { success: true };
  }
  /** Click element */
  async clickElement(params) {
    try {
      const element = await this.findElement(params);
      if (!element)
        return { success: false, error: "Element not found" };
      const htmlElement = element;
      if (params.doubleClick) {
        htmlElement.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
      } else {
        htmlElement.click();
      }
      return { success: true, clicked: true, elementTag: element.tagName };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
  /** Fill input field */
  async fillInputField(params) {
    try {
      const element = await this.findElement(params);
      if (!element)
        return { success: false, error: "Element not found" };
      if (!["INPUT", "TEXTAREA"].includes(element.tagName))
        return { success: false, error: "Not an input element" };
      const inputElement = element;
      if (params.clearFirst)
        inputElement.value = "";
      inputElement.focus();
      inputElement.value = params.value;
      inputElement.dispatchEvent(new Event("input", { bubbles: true }));
      inputElement.dispatchEvent(new Event("change", { bubbles: true }));
      return { success: true, filled: true, value: inputElement.value };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
  /** Select dropdown option */
  async selectDropdownOption(params) {
    try {
      const element = await this.findElement(params);
      if (!element)
        return { success: false, error: "Element not found" };
      if (!element || element.tagName !== "SELECT")
        return { success: false, error: "Not a select element" };
      const selectElement = element;
      if (params.value !== void 0) {
        selectElement.value = params.value;
      } else if (params.text !== void 0) {
        const option = Array.from(selectElement.options).find((opt) => opt.text === params.text);
        if (option)
          selectElement.value = option.value;
      } else if (params.index !== void 0) {
        selectElement.selectedIndex = params.index;
      }
      selectElement.dispatchEvent(new Event("change", { bubbles: true }));
      return { success: true, selected: selectElement.value };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
  /** Scroll page */
  async scrollPage(params) {
    const { direction = "down", pixels = 500, toElement } = params;
    try {
      if (toElement) {
        const element = document.querySelector(toElement);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          return { success: true, action: "scrolled_to_element" };
        }
      }
      const scrollActions = {
        up: () => window.scrollBy({ top: -pixels, behavior: "smooth" }),
        down: () => window.scrollBy({ top: pixels, behavior: "smooth" }),
        top: () => window.scrollTo({ top: 0, behavior: "smooth" }),
        bottom: () => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })
      };
      scrollActions[direction]?.();
      return { success: true, action: `scrolled_${direction}`, pixels };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
  /**
   * Highlights a DOM element by dimming the page and pointing a hand at it.
   * @param {Element} element - The DOM element to highlight
   * @param {string} [instruction] - Optional text to show (e.g. "Click here")
   */
  showGuidedAction(targetElement) {
    const tagName = "onecall-guidance-layer";
    document.querySelector(tagName)?.remove();
    const guideLayer = document.createElement(tagName);
    const beacon = document.createElement("onecall-guide-beacon");
    const spotlight = document.createElement("div");
    spotlight.className = "spotlight-hole";
    const hand = document.createElement("div");
    hand.className = "guide-hand";
    hand.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 1536 1792"><path fill="currentColor" d="M1280 1600q0-26-19-45t-45-19t-45 19t-19 45t19 45t45 19t45-19t19-45m128-764q0-189-167-189q-26 0-56 5q-16-30-52.5-47.5T1059 587t-69 18q-50-53-119-53q-25 0-55.5 10T768 587V256q0-52-38-90t-90-38q-51 0-89.5 39T512 256v576q-20 0-48.5-15t-55-33t-68-33t-84.5-15q-67 0-97.5 44.5T128 896q0 24 139 90q44 24 65 37q64 40 145 112q81 71 106 101q57 69 57 140v32h640v-32q0-72 32-167t64-193.5t32-179.5m128-5q0 133-69 322q-59 164-59 223v288q0 53-37.5 90.5T1280 1792H640q-53 0-90.5-37.5T512 1664v-288q0-10-4.5-21.5t-14-23.5t-18-22.5t-22.5-24t-21.5-20.5t-21.5-19t-17-14q-74-65-129-100q-21-13-62-33t-72-37t-63-40.5t-49.5-55T0 896q0-125 67-206.5T256 608q68 0 128 22V256q0-104 76-180T639 0q105 0 181 75.5T896 256v169q62 4 119 37q21-3 43-3q101 0 178 60q139-1 219.5 85t80.5 227"/></svg>`;
    guideLayer.appendChild(spotlight);
    guideLayer.appendChild(beacon);
    guideLayer.appendChild(hand);
    document.body.appendChild(guideLayer);
    this.injectStyles();
    const updatePosition = () => {
      const rect = targetElement.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
      Object.assign(spotlight.style, {
        top: `${rect.top + scrollTop}px`,
        left: `${rect.left + scrollLeft}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`
      });
      Object.assign(hand.style, {
        top: `${rect.bottom + scrollTop + 10}px`,
        left: `${rect.left + scrollLeft + rect.width / 2}px`
      });
      Object.assign(beacon.style, {
        top: `${rect.top + scrollTop - 10}px`,
        left: `${rect.left + scrollLeft}px`
      });
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);
    const cleanup = () => {
      guideLayer?.remove();
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
      targetElement.removeEventListener("click", cleanup);
    };
    targetElement.addEventListener("click", cleanup);
    guideLayer.addEventListener("click", cleanup);
    setTimeout(() => cleanup(), 3e4);
  }
  injectStyles() {
    if (document.getElementById("onecall-guidance-styles"))
      return;
    const style = document.createElement("style");
    style.id = "onecall-guidance-styles";
    style.textContent = `
    onecall-guidance-layer {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 0;
      z-index: 2147483647; /* Max Z-Index */
    }

    /* THE MAGIC: A transparent box with a massive shadow */
    .spotlight-hole {
      position: absolute;
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6); /* Dimmed Background */
      border-radius: 4px;
      pointer-events: none; /* Let clicks pass through to the real element */
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      
      /* Add a subtle pulsing glow on the element itself */
      animation: onecall-pulse-border 2s infinite;
    }

    .guide-hand {
      position: absolute;
      width: 40px;
      height: 40px;
      pointer-events: none;
      filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
      
      /* Animate the hand tapping */
      animation: onecall-tap 1.5s infinite ease-in-out;
      transform-origin: 0 0;
      z-index: 2147483648;
    }

    .guide-label {
      position: absolute;
      left: 45px;
      top: 0;
      background: white;
      color: black;
      padding: 6px 12px;
      border-radius: 6px;
      font-family: system-ui, sans-serif;
      font-size: 14px;
      font-weight: 600;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }

	onecall-guide-beacon {
		position: absolute;
		z-index: 5000;
		width: 20px;
		height: 20px;
		border: 5px solid #ff0000;
		border-radius: 50%;
		animation: pulse 1.5s infinite;
		pointer-events: none;
		visibility: visible !important;
	}
    
    /* Animations */
    @keyframes onecall-pulse-border {
      0% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 0 0px rgba(255, 255, 255, 0.7); }
      70% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 0 10px rgba(255, 255, 255, 0); }
      100% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 0 0px rgba(255, 255, 255, 0); }
    }

    @keyframes onecall-tap {
      0% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(0, 10px) scale(1.2); } /* Pull back */
      100% { transform: translate(0, 0) scale(1); } /* Tap */
    }

	@keyframes pulse {
	0% {
		transform: scale(1);
		opacity: 1;
	}

	100% {
		transform: scale(1.5);
		opacity: 0;
	}
}`;
    document.head.appendChild(style);
  }
}
export {
  InteractionTools
};
