import type { FastifyInstance } from "fastify";
import { KnowledgeHandlers } from "./handlers.ts";
import * as schema from "./schema.ts";

export async function knowledgeRoutes(fastify: FastifyInstance) {
	const handlers = new KnowledgeHandlers(
		fastify.knowledgeService,
		fastify.documentProcessorService,
		fastify.vectorSearchService,
		fastify.domainVerificationService
	);

	fastify.post(
		"/:domainId/upload",
		{
			schema: schema.uploadDocumentSchema,
			onRequest: [fastify.authenticateOwner],
		},
		handlers.uploadDocument
	);

	fastify.post(
		"/:domainId/faq",
		{
			schema: schema.addFAQSchema,
			onRequest: [fastify.authenticateOwner],
		},
		handlers.addFAQ
	);

	fastify.post(
		"/:domainId/scrape",
		{
			schema: schema.scrapeURLSchema,
			onRequest: [fastify.authenticateOwner],
		},
		handlers.scrapeURL
	);

	fastify.get(
		"/:domainId",
		{
			schema: schema.listDocumentsSchema,
			onRequest: [fastify.authenticateOwner],
		},
		handlers.listDocuments
	);

	fastify.get(
		"/:domainId/:docId",
		{
			schema: schema.getDocumentSchema,
			onRequest: [fastify.authenticateOwner],
		},
		handlers.getDocument
	);

	fastify.delete(
		"/:domainId/:docId",
		{
			schema: schema.deleteDocumentSchema,
			onRequest: [fastify.authenticateOwner],
		},
		handlers.deleteDocument
	);

	fastify.post(
		"/:domainId/search",
		{
			schema: schema.searchKnowledgeSchema,
		},
		handlers.searchKnowledge
	);

	fastify.get(
		"/jobs/:jobId",
		{
			schema: schema.getJobStatusSchema,
		},
		handlers.getJobStatus
	);
}
