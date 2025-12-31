class TabTools {
  /** Bring current tab to front */
  async bringTabToFront() {
    try {
      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: "BRING_TAB_TO_FRONT" }, resolve);
      });
      return { success: true, focused: response.focused };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
  /** Find text pattern on page with highlighting */
  async findTextPattern(params) {
    const { pattern, caseSensitive = false, highlightAll = false } = params;
    try {
      const regex = new RegExp(pattern, caseSensitive ? "g" : "gi");
      const matches = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode: (node2) => {
          if (node2.nodeValue?.match(regex)) return NodeFilter.FILTER_ACCEPT;
          return NodeFilter.FILTER_SKIP;
        }
      });
      let node;
      while (node = walker.nextNode()) {
        const text = node.nodeValue || "";
        const match = text.match(regex);
        if (match) {
          const position = text.indexOf(match[0]);
          const context = this.getContextAroundMatch(text, position, 50);
          matches.push({ text: match[0], context, position });
          if (highlightAll) this.highlightTextInNode(node, pattern, caseSensitive);
        }
      }
      if (matches.length > 0 && !highlightAll) window.find(pattern, caseSensitive, false, true);
      return { success: true, matches, count: matches.length, pattern };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
  /** Get page metadata */
  async getPageMetadata() {
    try {
      const metadata = {
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.getAttribute("content"),
        keywords: document.querySelector('meta[name="keywords"]')?.getAttribute("content"),
        author: document.querySelector('meta[name="author"]')?.getAttribute("content"),
        canonical: document.querySelector('link[rel="canonical"]')?.href,
        ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute("content"),
        ogDescription: document.querySelector('meta[property="og:description"]')?.getAttribute("content"),
        ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute("content"),
        lang: document.documentElement.lang,
        charset: document.characterSet
      };
      return { success: true, metadata };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
  /** Extract structured data (JSON-LD) */
  async extractStructuredData() {
    try {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      const structuredData = [];
      scripts.forEach((script) => {
        try {
          const data = JSON.parse(script.textContent || "{}");
          structuredData.push(data);
        } catch {
        }
      });
      return { success: true, data: structuredData, count: structuredData.length };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
  /** Get context around match */
  getContextAroundMatch(text, position, contextLength) {
    const start = Math.max(0, position - contextLength);
    const end = Math.min(text.length, position + contextLength);
    let context = text.slice(start, end);
    if (start > 0) context = "..." + context;
    if (end < text.length) context = context + "...";
    return context;
  }
  /** Highlight text in node */
  highlightTextInNode(node, pattern, caseSensitive) {
    const parent = node.parentNode;
    if (!parent) return;
    const text = node.nodeValue || "";
    const regex = new RegExp(`(${pattern})`, caseSensitive ? "g" : "gi");
    const parts = text.split(regex);
    const fragment = document.createDocumentFragment();
    parts.forEach((part) => {
      if (part.match(regex)) {
        const mark = document.createElement("mark");
        mark.style.backgroundColor = "#FFEB3B";
        mark.style.color = "#000";
        mark.textContent = part;
        fragment.appendChild(mark);
      } else {
        fragment.appendChild(document.createTextNode(part));
      }
    });
    parent.replaceChild(fragment, node);
  }
  /** Clear all highlights */
  clearHighlights() {
    document.querySelectorAll("mark").forEach((mark) => {
      const text = mark.textContent || "";
      const textNode = document.createTextNode(text);
      mark.parentNode?.replaceChild(textNode, mark);
    });
    return { success: true, cleared: true };
  }
}
export {
  TabTools
};
