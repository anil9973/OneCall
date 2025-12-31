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

export type VoiceGender = "male" | "female" | "neutral";
export type AgeGroup = "young" | "middle_aged" | "old";
export type VoiceAccent = "american" | "british" | "australian" | "indian" | "neutral";

export interface UserContext {
	gender?: VoiceGender;
	ageGroup?: AgeGroup;
	accent?: VoiceAccent;
	language?: string;
	profession?: string;
}

export interface VoiceInfo {
	voice_id: string;
	name: string;
	category: string;
	labels: {
		gender?: string;
		age?: string;
		accent?: string;
		use_case?: string;
	};
	preview_url?: string;
}

export interface VoiceFilterCriteria {
	gender?: VoiceGender;
	age?: AgeGroup;
	accent?: VoiceAccent;
	language?: string;
	useCase?: "conversational" | "narration" | "characters";
}

export interface ConversationTokenRequest {
	websiteType?: WebsiteType;
	userContext?: UserContext;
	voiceId?: string;
}

export interface ConversationTokenResponse {
	token: string;
	agentId: string;
	voiceId: string;
	voiceName: string;
	expiresIn: number;
}

export interface ToolConfig {
	type: "client" | "webhook" | "system";
	name: string;
	description: string;
	parameters?: ToolParameter[];
	responseTimeoutSecs?: number;
	disableInterruptions?: boolean;
	forcePreToolSpeech?: boolean;
}

export interface ToolParameter {
	name: string;
	type: "string" | "number" | "boolean" | "object" | "array";
	description: string;
	required: boolean;
	enum?: string[];
	properties?: Record<string, ToolParameter>;
}

export interface AgentConfig {
	id: string;
	name: string;
	websiteType: WebsiteType;
	tools: string[];
}

declare module "fastify" {
	interface FastifyInstance {
		config: {
			NODE_ENV: string;
			PORT: number;
			HOST: string;
			ELEVENLABS_API_KEY: string;
			AGENT_BASE_ID: string;
			AGENT_SHOPPING_ID: string;
			AGENT_FINANCE_ID: string;
			AGENT_ENTERTAINMENT_ID: string;
			AGENT_LEARNING_ID: string;
			AGENT_PROGRAMMING_ID: string;
			AGENT_NEWS_ID: string;
			AGENT_RESEARCH_ID: string;
			AGENT_SOCIAL_MEDIA_ID: string;
			AGENT_PRODUCTIVITY_ID: string;
			AGENT_DOCUMENTATION_ID: string;
			RATE_LIMIT_MAX: number;
			RATE_LIMIT_WINDOW: number;
			CORS_ORIGIN: string;
		};
	}
}
