class WebsiteDetector {
  cache = /* @__PURE__ */ new Map();
  cacheDuration = 6048e5;
  // 7 days
  patterns = {
    shopping: /shop|store|cart|checkout|buy|product|amazon|ebay|walmart|etsy|target/i,
    finance: /bank|trading|stock|crypto|wallet|investment|paypal|venmo|robinhood|coinbase/i,
    entertainment: /watch|play|stream|video|music|netflix|spotify|youtube|hulu|disney/i,
    learning: /course|learn|lesson|quiz|udemy|coursera|khan|edx|skillshare|pluralsight/i,
    programming: /github|stackoverflow|code|dev|npm|gitlab|bitbucket|codepen|replit/i,
    news: /news|article|blog|medium|post|reuters|nytimes|bbc|cnn|forbes/i,
    research: /paper|research|scholar|arxiv|wiki|journal|pubmed|ieee|springer/i,
    "social-media": /twitter|facebook|linkedin|reddit|instagram|tiktok|snapchat|social/i,
    productivity: /notion|trello|asana|monday|slack|task|project|jira|basecamp/i,
    documentation: /docs|api|reference|guide|manual|documentation|swagger|readme/i,
    base: /.*/
  };
  /** Detect website type */
  async detect(url) {
    const domain = new URL(url).hostname;
    const cached = this.cache.get(domain);
    if (cached && Date.now() < cached.expires) return cached.type;
    const regexType = this.detectByRegex(url);
    if (regexType !== "base") {
      this.cacheResult(domain, regexType);
      return regexType;
    }
    this.cacheResult(domain, "base");
    return "base";
  }
  /** Detect using regex patterns */
  detectByRegex(url) {
    const urlLower = url.toLowerCase();
    for (const [type, pattern] of Object.entries(this.patterns)) {
      if (type === "base") continue;
      if (pattern.test(urlLower)) return type;
    }
    return "base";
  }
  /** Cache detection result */
  cacheResult(domain, type) {
    this.cache.set(domain, { type, expires: Date.now() + this.cacheDuration });
    chrome.storage.local.set({
      [`website_type_${domain}`]: { type, expires: Date.now() + this.cacheDuration }
    });
  }
  /** Load cached results from storage */
  async loadCache() {
    const keys = await chrome.storage.local.get(null);
    for (const [key, value] of Object.entries(keys)) {
      if (!key.startsWith("website_type_")) continue;
      const domain = key.replace("website_type_", "");
      const data = value;
      if (Date.now() < data.expires) this.cache.set(domain, data);
    }
  }
  /** Clear cache */
  clearCache() {
    this.cache.clear();
    chrome.storage.local.clear();
  }
}
export {
  WebsiteDetector
};
