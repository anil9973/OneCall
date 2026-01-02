export type MessageRole = "user" | "assistant" | "system";
export type ConversationStatus = "active" | "escalated" | "resolved" | "archived";
export type ResolutionType = "resolved" | "unresolved" | "escalated" | "abandoned";
export type DocumentType = "pdf" | "txt" | "md" | "docx" | "faq" | "url" | "conversation";
export type DocumentStatus = "processing" | "ready" | "failed";
export type ToolType = "http" | "webhook" | "mcp";

export interface BackendMessage {
	id: string;
	role: MessageRole;
	content: string;
	timestamp: number;
	audioUrl?: string;
	duration?: number;
	toolCalls?: string[];
	metadata?: Record<string, unknown>;
}

export interface ConversationMetrics {
	duration: number;
	turnCount: number;
	escalated: boolean;
	aiHandled: boolean;
	escalationReason?: string;
}

export interface BackendConversation {
	id: string;
	sessionId: string;
	domain: string;
	userId: string;
	ownerId?: string;
	status: ConversationStatus;
	startedAt: number;
	endedAt?: number;
	messages: BackendMessage[];
	toolCalls: string[];
	metrics: ConversationMetrics;
	metadata?: Record<string, unknown>;
}

export interface ConversationSummary {
	id: string;
	sessionId: string;
	domain: string;
	status: ConversationStatus;
	startedAt: number;
	endedAt?: number;
	messageCount: number;
	duration: number;
	escalated: boolean;
	lastMessage?: string;
}

export interface ConversationFilter {
	domain?: string;
	status?: ConversationStatus;
	startDate?: number;
	endDate?: number;
	escalated?: boolean;
	limit?: number;
	offset?: number;
}

export interface KnowledgeDocument {
	id: string;
	domainId: string;
	title: string;
	type: DocumentType;
	fileUrl?: string;
	uploadedAt: number;
	status: DocumentStatus;
	chunkCount: number;
	metadata?: {
		size?: number;
		pages?: number;
		author?: string;
		url?: string;
		[key: string]: unknown;
	};
	error?: string;
}

export interface SearchResult {
	chunkId?: string;
	faqId?: string;
	content: string;
	score: number;
	metadata?: Record<string, unknown>;
	type: "chunk" | "faq";
}

export interface Owner {
	id: string;
	email: string;
	name: string;
	company?: string;
	plan: "free" | "basic" | "premium";
	createdAt: number;
	emailVerified: boolean;
}

export interface Domain {
	id: string;
	ownerId: string;
	domain: string;
	verified: boolean;
	verificationMethod?: "dns" | "html_meta" | "file_upload";
	verificationCode: string;
	verifiedAt?: number;
	createdAt: number;
	settings: {
		allowEscalation: boolean;
		workingHours?: {
			timezone: string;
			days: Record<string, { open: string; close: string }>;
		};
		voiceId?: string;
		autoEscalateKeywords?: string[];
		maxAIDuration?: number;
	};
}

export interface Tool {
	id: string;
	domainId: string;
	name: string;
	description: string;
	type: ToolType;
	enabled: boolean;
	config: unknown;
	createdAt: number;
	updatedAt: number;
}
