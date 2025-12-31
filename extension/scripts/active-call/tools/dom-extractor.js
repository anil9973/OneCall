const ELEMENT_CONFIG = {
  MAX_ELEMENTS: 150,
  TEXT_CONTEXT_SIZE: 150,
  ALWAYS_INCLUDE_FORMS: true,
  USE_HIERARCHY: false,
  INCLUDE_POSITION: true,
  UI_LIBRARIES: {
    REACT: ["[data-testid]", "[data-qa]", "[data-e2e]"],
    ANGULAR: ["[ng-click]", "[ng-submit]", "[data-ng-model]"],
    VUE: ["[v-click]", "[v-model]", "[data-v-*]"],
    BOOTSTRAP: [".btn", ".btn-primary", ".form-control", ".form-check"],
    MATERIAL_UI: [".MuiButton-root", ".MuiInput-root", ".MuiSelect-root"],
    TAILWIND: ['[class*="px-"]', '[class*="py-"]'],
    CUSTOM: ["[data-action]", "[data-type]", "[data-id]"]
  }
};
class DOMExtractor {
  static elementMap = /* @__PURE__ */ new Map();
  elementData = [];
  contextCache = /* @__PURE__ */ new Map();
  selectors = {
    input: () => [
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"])',
      "textarea",
      '[contenteditable="true"]',
      '[contenteditable="plaintext-only"]',
      ...ELEMENT_CONFIG.UI_LIBRARIES.REACT.filter((s) => s.includes("[data"))
    ],
    select: () => [
      "select",
      '[role="listbox"]',
      '[role="combobox"]',
      '[role="menu"]',
      ".dropdown",
      '[data-type="select"]',
      ".MuiSelect-root"
    ],
    upload: () => ['input[type="file"]'],
    click: () => [
      "a[href]",
      "button",
      'input[type="submit"]',
      'input[type="button"]',
      '[role="button"]',
      '[role="link"]',
      '[role="menuitem"]',
      '[role="tab"]',
      "[onclick]",
      ".btn",
      ".button",
      "[data-action]",
      ".MuiButton-root",
      "[ng-click]"
    ],
    generic: () => [
      'input:not([type="hidden"])',
      "button",
      "a[href]",
      "select",
      "textarea",
      '[role="button"]',
      "[onclick]",
      "[data-action]"
    ]
  };
  /** Extract only interactive elements for ElevenLabs */
  async extractInteractiveElements(stepType) {
    const elements = [];
    const selectors = this.selectors[stepType]();
    this.queryAllElements(selectors).forEach((el, idx) => {
      if (!this.isValid(el))
        return;
      const eId = `el_${Date.now()}_${idx}`;
      DOMExtractor.elementMap.set(eId, el);
      elements.push(this.extractInteractiveData(el, eId));
    });
    return elements;
  }
  /** Extract minimal data for interactive element */
  extractInteractiveData(element, eId) {
    const rect = element.getBoundingClientRect();
    const htmlEl = element;
    return {
      eId,
      tag: element.tagName.toLowerCase(),
      indexPath: this.getElemIndexPath(element),
      textContent: this.extractCleanText(element),
      position: {
        pos: this.getPositionLabel(rect),
        coords: {
          top: Math.round(rect.top),
          left: Math.round(rect.left),
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        }
      },
      type: "interactive",
      selector: {
        id: element.id || null,
        className: element.className || null,
        role: element.getAttribute("role") || null,
        ariaLabel: element.getAttribute("aria-label") || null
      },
      interactive: {
        clickable: true,
        href: element.href || void 0,
        inputType: element.type || void 0,
        placeholder: element.placeholder || void 0,
        options: this.extractOptions(element)
      }
    };
  }
  /** Get simple position label */
  getPositionLabel(rect) {
    const vh = innerHeight;
    const vw = innerWidth;
    const vertical = rect.top < vh / 3 ? "top" : rect.top > vh * 2 / 3 ? "bottom" : "middle";
    const horizontal = rect.left < vw / 3 ? "left" : rect.left > vw * 2 / 3 ? "right" : "center";
    return `${vertical}-${horizontal}`;
  }
  // /** Extract all relevant elements */
  // async extractAllElements(stepType: keyof typeof this.selectors = "generic"): Promise<ElementData[]> {
  // 	DOMExtractor.elementMap.clear();
  // 	this.elementData = [];
  // 	this.contextCache.clear();
  // 	const selectors = this.selectors[stepType]();
  // 	const elements = this.queryAllElements(selectors);
  // 	for (let index = 0; index < elements.length; index++) {
  // 		const element = elements[index];
  // 		if (!this.isValid(element)) continue;
  // 		const elementId = `el_${this.elementData.length}`;
  // 		DOMExtractor.elementMap.set(elementId, element);
  // 		const elementData = this.extractElementData(element, elementId);
  // 		this.elementData.push(elementData);
  // 		if (this.elementData.length >= ELEMENT_CONFIG.MAX_ELEMENTS) {
  // 			console.warn(`Reached max elements limit (${ELEMENT_CONFIG.MAX_ELEMENTS})`);
  // 			break;
  // 		}
  // 	}
  // 	console.log(`Extracted ${this.elementData.length} elements`);
  // 	return this.elementData;
  // }
  /** Query all elements safely */
  queryAllElements(selectors) {
    const elements = /* @__PURE__ */ new Set();
    for (const selector of selectors) {
      try {
        document.querySelectorAll(selector).forEach((elem) => elements.add(elem));
      } catch (error) {
        console.warn(`Invalid selector: "${selector}"`);
      }
    }
    if (ELEMENT_CONFIG.ALWAYS_INCLUDE_FORMS)
      document.querySelectorAll("form, label, fieldset").forEach((elem) => elements.add(elem));
    return Array.from(elements);
  }
  /** Check if element is valid */
  isValid(element) {
    if (element.nodeType !== 1)
      return false;
    const style = window.getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden")
      return false;
    const htmlElement = element;
    if (htmlElement.offsetWidth === 0 || htmlElement.offsetHeight === 0)
      return false;
    if (["SCRIPT", "STYLE", "NOSCRIPT"].includes(element.tagName))
      return false;
    return true;
  }
  /** Extract clean text */
  extractCleanText(element) {
    const text = element.textContent || element.innerText || "";
    return text.trim().replace(/\s+/g, " ").substring(0, 200);
  }
  /* private getElementPosition(element: HTMLElement): { pos: string; coords: DOMRect } {
  		const rect = element.getBoundingClientRect();
  		const vh = innerHeight;
  		const vw = innerWidth;
  
  		const vertical = rect.top < vh / 3 ? "top" : rect.top > (vh * 2) / 3 ? "bottom" : "middle";
  		const horizontal = rect.left < vw / 3 ? "left" : rect.left > (vw * 2) / 3 ? "right" : "center";
  
  		return {
  			pos: `${vertical}-${horizontal}`,
  			coords: rect,
  		};
  	}
  
  	private isInViewport(element: HTMLElement): boolean {
  		const rect = element.getBoundingClientRect();
  		return rect.top < window.innerHeight && rect.bottom > 0 && rect.left < window.innerWidth && rect.right > 0;
  	} */
  // /** Get surrounding text context */
  // private getTextContext(element: Element, direction: "before" | "after" = "before"): string | null {
  // 	let context = "";
  // 	let current: Node | null = element as Node;
  // 	while (current && context.length < ELEMENT_CONFIG.TEXT_CONTEXT_SIZE) {
  // 		const sibling = direction === "before" ? current.previousSibling : current.nextSibling;
  // 		if (sibling?.nodeType === 3) {
  // 			context = direction === "before" ? sibling.textContent + context : context + sibling.textContent;
  // 		} else if (sibling?.nodeType === 1) {
  // 			context = direction === "before" ? sibling.textContent + context : context + sibling.textContent;
  // 		}
  // 		current = sibling;
  // 	}
  // 	return context.trim().substring(0, ELEMENT_CONFIG.TEXT_CONTEXT_SIZE) || null;
  // }
  // /** Find associated label */
  // private findLabel(element: Element): string | null {
  // 	if (element.id) {
  // 		const label = document.querySelector(`label[for="${element.id}"]`);
  // 		if (label) return this.extractCleanText(label);
  // 	}
  // 	const parentLabel = element.closest("label");
  // 	if (parentLabel) return this.extractCleanText(parentLabel);
  // 	const labelId = element.getAttribute("aria-labelledby");
  // 	if (labelId) {
  // 		const labelElem = document.getElementById(labelId);
  // 		if (labelElem) return this.extractCleanText(labelElem);
  // 	}
  // 	return null;
  // }
  // /** Check if form element */
  // private isFormElement(element: Element): boolean {
  // 	return ["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName);
  // }
  /** Extract select options */
  extractOptions(element) {
    if (element.tagName !== "SELECT")
      return null;
    const selectElement = element;
    return Array.from(selectElement.options).slice(0, 30).map((opt) => ({
      val: opt.value,
      txt: opt.text.trim(),
      sel: opt.selected,
      dis: opt.disabled
    }));
  }
  /** Get element index path */
  getElemIndexPath(node) {
    const element = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    const indexTree = [this.getChildIndex(element)];
    let parentElem = element;
    while (parentElem = parentElem.parentElement) {
      if (parentElem === document.body)
        break;
      indexTree.push(this.getChildIndex(parentElem));
    }
    return indexTree.reverse();
  }
  /** Get child index */
  getChildIndex(element) {
    if (!element.parentElement)
      return 0;
    return Array.from(element.parentElement.children).indexOf(element);
  }
  /** Get element by ID */
  getElementByEId(eId) {
    return DOMExtractor.elementMap.get(eId);
  }
  /** Get element by index path */
  getElementByIndexPath(positionTree) {
    let parentElem = document.body;
    for (const elemIdx of positionTree)
      parentElem = parentElem.children[elemIdx];
    return parentElem;
  }
  /** Clear all data */
  clear() {
    DOMExtractor.elementMap.clear();
    this.elementData = [];
    this.contextCache.clear();
  }
}
export {
  DOMExtractor
};
