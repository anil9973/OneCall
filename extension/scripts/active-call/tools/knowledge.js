class KnowledgeTools {
  /** Search site knowledge base (FAQs, docs) */
  async knowledgeBaseSearch(params) {
    const { query, limit = 5 } = params;
    try {
      const faqResults = this.searchInElements(query, [
        '[class*="faq" i]',
        '[id*="faq" i]',
        '[class*="help" i]',
        '[id*="help" i]',
        '[class*="support" i]',
        '[id*="support" i]'
      ]);
      const docLinks = this.searchInElements(query, [
        'a[href*="docs"]',
        'a[href*="help"]',
        'a[href*="support"]',
        'a[href*="guide"]'
      ]);
      const metaResults = this.searchMetaTags(query);
      const results = [...faqResults.slice(0, limit), ...docLinks.slice(0, limit), ...metaResults.slice(0, limit)];
      return {
        success: true,
        results,
        count: results.length,
        query
      };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
  /** Check if user is authenticated on current site */
  async checkAuthentication() {
    try {
      const indicators = {
        loginButtons: document.querySelectorAll('a[href*="login"], button[onclick*="login"]').length,
        logoutButtons: document.querySelectorAll('a[href*="logout"], button[onclick*="logout"]').length,
        userMenus: document.querySelectorAll('[class*="user-menu" i], [id*="user-menu" i]').length,
        profileLinks: document.querySelectorAll('a[href*="profile"], a[href*="account"]').length,
        authTokens: this.checkLocalStorageAuth(),
        cookieSession: document.cookie.includes("session") || document.cookie.includes("auth")
      };
      const isAuthenticated = indicators.logoutButtons > 0 || indicators.userMenus > 0 || indicators.profileLinks > 0 || indicators.authTokens || indicators.cookieSession;
      return {
        success: true,
        authenticated: isAuthenticated,
        indicators,
        confidence: this.calculateAuthConfidence(indicators)
      };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
  /** Search in elements by selectors */
  searchInElements(query, selectors) {
    const results = [];
    const lowerQuery = query.toLowerCase();
    selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        const text = el.textContent?.trim() || "";
        if (text.toLowerCase().includes(lowerQuery)) {
          results.push({
            text: text.slice(0, 200),
            source: selector,
            relevance: this.calculateRelevance(text, lowerQuery)
          });
        }
      });
    });
    return results.sort((a, b) => b.relevance - a.relevance);
  }
  /** Search meta tags */
  searchMetaTags(query) {
    const results = [];
    const lowerQuery = query.toLowerCase();
    document.querySelectorAll("meta[name], meta[property]").forEach((meta) => {
      const content = meta.getAttribute("content") || "";
      if (content.toLowerCase().includes(lowerQuery)) {
        results.push({
          text: content,
          source: `meta:${meta.getAttribute("name") || meta.getAttribute("property")}`,
          relevance: this.calculateRelevance(content, lowerQuery)
        });
      }
    });
    return results;
  }
  /** Calculate text relevance score */
  calculateRelevance(text, query) {
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    let score = 0;
    if (lowerText.includes(lowerQuery)) score += 10;
    const queryWords = lowerQuery.split(" ");
    queryWords.forEach((word) => {
      if (lowerText.includes(word)) score += 2;
    });
    const position = lowerText.indexOf(lowerQuery);
    if (position !== -1) score += Math.max(5 - position / 100, 0);
    return score;
  }
  /** Check localStorage for auth tokens */
  checkLocalStorageAuth() {
    try {
      const keys = Object.keys(localStorage);
      const authKeys = ["token", "auth", "session", "jwt", "user"];
      return keys.some((key) => authKeys.some((authKey) => key.toLowerCase().includes(authKey)));
    } catch {
      return false;
    }
  }
  /** Calculate authentication confidence */
  calculateAuthConfidence(indicators) {
    let confidence = 0;
    if (indicators.logoutButtons > 0) confidence += 30;
    if (indicators.userMenus > 0) confidence += 25;
    if (indicators.profileLinks > 0) confidence += 20;
    if (indicators.authTokens) confidence += 15;
    if (indicators.cookieSession) confidence += 10;
    return Math.min(confidence, 100);
  }
}
export {
  KnowledgeTools
};
