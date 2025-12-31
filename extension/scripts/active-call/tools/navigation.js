class NavigationTools {
  constructor(domExtractor) {
    this.domExtractor = domExtractor;
  }
  /** Get current page context including URL, title, and interactive elements */
  async getPageContext() {
    function getMetaContent(property) {
      const meta = document.querySelector(`meta[property="${property}"], meta[name="${property}"]`);
      return meta instanceof HTMLMetaElement && meta["content"] || "";
    }
    function getNavigationContext() {
      const searchOrder = [
        "nav",
        '[role="navigation"]',
        '[class*="nav" i]',
        '[id*="nav" i]',
        "header",
        ".header",
        ".menu"
      ];
      let navContainer = null;
      for (const selector of searchOrder) {
        const candidates = document.querySelectorAll(selector);
        for (const el of candidates) {
          if (el.querySelectorAll("a[href]").length >= 3) {
            navContainer = el;
            break;
          }
        }
        if (navContainer)
          break;
      }
      if (!navContainer)
        navContainer = document.body;
      const rawLinks = Array.from(navContainer.querySelectorAll("a[href]"));
      const uniqueLinks = /* @__PURE__ */ new Map();
      rawLinks.forEach((link) => {
        if (uniqueLinks.size >= 10)
          return;
        const anchor = link;
        const text = anchor.innerText.trim() || anchor.getAttribute("aria-label") || "";
        const href = anchor.href;
        if (!text || href.startsWith("javascript:") || href === "#" || uniqueLinks.has(href))
          return;
        if (anchor.checkVisibility && !anchor.checkVisibility())
          return;
        uniqueLinks.set(href, { text: text.slice(0, 30), url: href });
      });
      return Array.from(uniqueLinks.values());
    }
    const primaryButtons = Array.from(document.querySelectorAll('button, a.btn, input[type="submit"]')).slice(0, 5);
    return {
      location: {
        url: window.location.href,
        domain: window.location.hostname,
        title: getMetaContent("og:title") || document.title,
        description: getMetaContent("og:description") || getMetaContent("description"),
        author: getMetaContent("author"),
        keywords: getMetaContent("keywords") || getMetaContent("tags")
      },
      navigation_shortcuts: getNavigationContext(),
      page_content: {
        firstHeading: document.querySelector("h1")?.textContent?.trim() || null,
        headings: Array.from(document.querySelectorAll("h1, h2, h3")).map((h) => ({
          level: h.tagName,
          text: h.textContent?.trim()
        })).slice(0, 10),
        // Summarized element counts (not full data)
        elementSummary: {
          primaryButtons,
          buttons: document.querySelectorAll('button, [role="button"]').length,
          links: document.querySelectorAll("a[href]").length,
          inputs: document.querySelectorAll("input, textarea").length,
          selects: document.querySelectorAll("select").length,
          forms: document.querySelectorAll("form").length
        },
        // First 500 chars of body text for context
        bodyPreview: document.body.innerText.replace(/\s+/g, " ").slice(0, 500).trim()
      },
      lang: document.documentElement.lang || null,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        scrollY: window.scrollY,
        scrollX: window.scrollX
      },
      user_context: {
        status: "loggedin"
      }
    };
  }
  /** Get all links on the page with filtering */
  async getAllLinks(params) {
    const { filter, includeExternal = false } = params;
    const links = [];
    document.querySelectorAll("a[href]").forEach((link) => {
      const anchor = link;
      const href = anchor.href;
      const text = anchor.textContent?.trim() || anchor.getAttribute("aria-label") || "";
      const isExternal = !href.startsWith(window.location.origin);
      if (!includeExternal && isExternal)
        return;
      if (filter && !text.toLowerCase().includes(filter.toLowerCase()) && !href.toLowerCase().includes(filter.toLowerCase()))
        return;
      links.push({ text, href, isExternal });
    });
    return { links, count: links.length };
  }
  /** Navigate to URL (updates current page) */
  async navigateToUrl(params) {
    const { url, newTab = false } = params;
    try {
      if (newTab) {
        chrome.runtime.sendMessage({ type: "OPEN_NEW_TAB", url });
        return { success: true, action: "opened_new_tab", url };
      }
      window.location.href = url;
      return { success: true, action: "navigated", url };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
}
export {
  NavigationTools
};
