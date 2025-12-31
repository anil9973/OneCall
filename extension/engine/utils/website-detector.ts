export type WebsiteType =
	| "shopping"
	| "finance"
	| "entertainment"
	| "learning"
	| "programming"
	| "news"
	| "research"
	| "social-media"
	| "productivity"
	| "documentation"
	| "base";

/** Detect website type using regex patterns and caching */
export class WebsiteDetector {
	private cache = new Map<string, { type: WebsiteType; expires: number }>();
	private readonly cacheDuration = 604800000; // 7 days

	private readonly patterns: Record<WebsiteType, RegExp> = {
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
		base: /.*/,
	};

	/** Detect website type */
	async detect(url: string): Promise<WebsiteType> {
		const domain = new URL(url).hostname;

		// Check cache
		const cached = this.cache.get(domain);
		if (cached && Date.now() < cached.expires) return cached.type;

		// Try regex detection
		const regexType = this.detectByRegex(url);
		if (regexType !== "base") {
			this.cacheResult(domain, regexType);
			return regexType;
		}

		// Fallback: Use Gemini AI (implement if needed)
		// const aiType = await this.detectByAI(url);

		this.cacheResult(domain, "base");
		return "base";
	}

	/** Detect using regex patterns */
	private detectByRegex(url: string): WebsiteType {
		const urlLower = url.toLowerCase();

		for (const [type, pattern] of Object.entries(this.patterns)) {
			if (type === "base") continue;
			if (pattern.test(urlLower)) return type as WebsiteType;
		}

		return "base";
	}

	/** Cache detection result */
	private cacheResult(domain: string, type: WebsiteType) {
		this.cache.set(domain, { type, expires: Date.now() + this.cacheDuration });

		// Persist to chrome.storage
		chrome.storage.local.set({
			[`website_type_${domain}`]: { type, expires: Date.now() + this.cacheDuration },
		});
	}

	/** Load cached results from storage */
	async loadCache() {
		const keys = await chrome.storage.local.get(null);
		for (const [key, value] of Object.entries(keys)) {
			if (!key.startsWith("website_type_")) continue;

			const domain = key.replace("website_type_", "");
			const data = value as { type: WebsiteType; expires: number };

			if (Date.now() < data.expires) this.cache.set(domain, data);
		}
	}

	/** Clear cache */
	clearCache() {
		this.cache.clear();
		chrome.storage.local.clear();
	}
}
