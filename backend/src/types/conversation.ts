export type MessageRole = "user" | "assistant" | "system";
export type ConversationStatus = "active" | "ended" | "archived";
export type ResolutionType = "resolved" | "unresolved" | "escalated" | "abandoned";

export interface Message {
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

export interface Conversation {
	id: string;
	sessionId: string;
	domain: string;
	userId: string;
	ownerId?: string;
	status: ConversationStatus;
	startedAt: number;
	endedAt?: number;
	messages: Message[];
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
	resolution?: ResolutionType;
	rating?: number;
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

export interface ConversationSearchQuery {
	query: string;
	domain?: string;
	limit?: number;
}
