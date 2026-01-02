import type { BackendConversation, ConversationSummary, ConversationFilter } from "../types/backend-types.js";
import { apiClient } from "../client.js";

class ConversationService {
	async list(filters?: ConversationFilter): Promise<ConversationSummary[]> {
		const response = await apiClient.get<{ conversations: ConversationSummary[] }>("/conversations", filters as any);
		return response.conversations;
	}

	async get(id: string): Promise<BackendConversation> {
		return apiClient.get<BackendConversation>(`/conversations/${id}`);
	}

	async search(query: string, domain?: string, limit?: number): Promise<ConversationSummary[]> {
		const response = await apiClient.get<{ conversations: ConversationSummary[] }>("/conversations/search", {
			query,
			domain,
			limit,
		} as any);
		return response.conversations;
	}

	async start(data: {
		sessionId: string;
		domain: string;
		userId: string;
		ownerId?: string;
	}): Promise<{ id: string }> {
		return apiClient.post("/conversations/start", data);
	}

	async addMessage(
		conversationId: string,
		data: {
			role: "user" | "assistant" | "system";
			content: string;
			timestamp: number;
			audioUrl?: string;
			duration?: number;
		}
	): Promise<void> {
		await apiClient.post(`/conversations/${conversationId}/message`, data);
	}

	async end(
		conversationId: string,
		data: {
			resolution?: "resolved" | "unresolved" | "escalated" | "abandoned";
			rating?: number;
			duration: number;
		}
	): Promise<void> {
		await apiClient.post(`/conversations/${conversationId}/end`, data);
	}
}

export const conversationService = new ConversationService();
