import { ElevenLabsService } from "../../services/elevenlabs.service.ts";
import type { FastifyRequest, FastifyReply } from "fastify";
import type { ConversationTokenRequest } from "../../types/index.ts";
import type { ConversationService } from "../../services/conversation.service.ts";
import type { Message } from "../../types/conversation.ts";

interface StartConversationBody {
	sessionId: string;
	domain: string;
	userId: string;
	ownerId?: string;
	metadata?: Record<string, unknown>;
}

interface AddMessageBody extends Omit<Message, "id"> {}

interface EndConversationBody {
	resolution?: string;
	rating?: number;
	duration?: number;
}

interface ListConversationsQuery {
	domain?: string;
	status?: "active" | "ended" | "archived";
	startDate?: number;
	endDate?: number;
	escalated?: boolean;
	limit?: number;
	offset?: number;
}

interface SearchConversationsQuery {
	query: string;
	domain?: string;
	limit?: number;
}

export class ConversationHandlers {
	private elevenLabsService: ElevenLabsService;
	private conversationService: ConversationService;

	constructor(conversationService: ConversationService, apiKey: string) {
		this.elevenLabsService = new ElevenLabsService(apiKey);
		this.conversationService = conversationService;
	}

	/** Get conversation token */
	async getToken(request: FastifyRequest<{ Body: ConversationTokenRequest }>, reply: FastifyReply) {
		try {
			const { websiteType = "base", userContext } = request.body;
			const result = await this.elevenLabsService.getConversationToken(websiteType, userContext);
			return reply.code(200).send(result);
		} catch (error) {
			request.log.error(error, "Failed to generate conversation token");
			return reply.code(500).send({
				error: "Failed to generate conversation token",
				message: error instanceof Error ? error.message : "Unknown error",
			});
		}
	}

	/** Get available agents */
	async getAgents(request: FastifyRequest, reply: FastifyReply) {
		try {
			const agents = this.elevenLabsService.getAgents();
			return reply.code(200).send({ agents });
		} catch (error) {
			request.log.error(error, "Failed to get agents");
			return reply.code(500).send({
				error: "Failed to get agents",
				message: error instanceof Error ? error.message : "Unknown error",
			});
		}
	}

	async startConversation(request: FastifyRequest<{ Body: StartConversationBody }>, reply: FastifyReply) {
		const conversation = await this.conversationService.startConversation(request.body);

		return {
			id: conversation.id,
			sessionId: conversation.sessionId,
			status: conversation.status,
		};
	}

	async addMessage(request: FastifyRequest<{ Params: { id: string }; Body: AddMessageBody }>, reply: FastifyReply) {
		const { id } = request.params;

		try {
			const message = await this.conversationService.addMessage(id, request.body);
			return message;
		} catch (error) {
			const msg = error instanceof Error ? error.message : "Unknown error";
			return reply.code(404).send({ error: msg });
		}
	}

	async endConversation(
		request: FastifyRequest<{ Params: { id: string }; Body: EndConversationBody }>,
		reply: FastifyReply
	) {
		const { id } = request.params;
		await this.conversationService.endConversation(id, request.body);
		return { success: true };
	}

	async getConversation(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
		const { id } = request.params;
		const ownerId = request.owner?.id;
		const conversation = await this.conversationService.getConversation(id);
		if (!conversation) return reply.code(404).send({ error: "Conversation not found" });
		if (ownerId && conversation.ownerId !== ownerId) return reply.code(403).send({ error: "Access denied" });
		return conversation;
	}

	async listConversations(request: FastifyRequest<{ Querystring: ListConversationsQuery }>, reply: FastifyReply) {
		const ownerId = request.owner?.id;
		if (!ownerId) return reply.code(401).send({ error: "Unauthorized" });

		const filter = { ...request.query };
		const conversations = await this.conversationService.listConversations(filter);
		const filtered = conversations.filter((c) => {
			if (!filter.domain) return true;
			return c.domain === filter.domain;
		});

		return {
			conversations: filtered,
			total: filtered.length,
		};
	}

	async searchConversations(request: FastifyRequest<{ Querystring: SearchConversationsQuery }>, reply: FastifyReply) {
		const ownerId = request.owner?.id;
		if (!ownerId) return reply.code(401).send({ error: "Unauthorized" });

		const searchQuery = request.query;
		const conversations = await this.conversationService.searchConversations(searchQuery);

		return {
			conversations,
			total: conversations.length,
		};
	}
}
