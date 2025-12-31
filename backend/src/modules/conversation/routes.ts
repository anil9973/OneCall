import type { FastifyInstance } from "fastify";
import { ConversationHandlers } from "./handlers.ts";
import {
	addMessageSchema,
	conversationTokenRequestSchema,
	conversationTokenResponseSchema,
	endConversationSchema,
	getConversationSchema,
	listConversationsSchema,
	searchConversationsSchema,
	startConversationSchema,
} from "./schema.ts";

export async function conversationRoutes(fastify: FastifyInstance) {
	const handlers = new ConversationHandlers(fastify.conversationService, fastify.config.ELEVENLABS_API_KEY);

	fastify.post("/token", {
		schema: {
			body: conversationTokenRequestSchema,
			response: {
				200: conversationTokenResponseSchema,
			},
		},
		handler: handlers.getToken.bind(handlers),
	});

	fastify.get("/agents", {
		handler: handlers.getAgents.bind(handlers),
	});

	fastify.post("/start", { schema: startConversationSchema }, handlers.startConversation);

	fastify.post("/:id/message", { schema: addMessageSchema }, handlers.addMessage);

	fastify.post("/:id/end", { schema: endConversationSchema }, handlers.endConversation);

	/* fastify.get(
		"/:id",
		{ schema: getConversationSchema, onRequest: [fastify.authenticateOptional] },
		handlers.getConversation
	);

	fastify.get(
		"/",
		{ schema: listConversationsSchema, onRequest: [fastify.authenticateOwner] },
		handlers.listConversations
	);

	fastify.get(
		"/search",
		{ schema: searchConversationsSchema, onRequest: [fastify.authenticateOwner] },
		handlers.searchConversations
	); */
}
