import type { FastifyInstance } from "fastify";
import { DomainHandlers } from "./handlers.ts";
import * as schema from "./schema.ts";

export async function domainRoutes(fastify: FastifyInstance) {
	const handlers = new DomainHandlers(fastify.domainVerificationService);

	fastify.post(
		"/",
		{
			schema: schema.addDomainSchema,
			onRequest: [fastify.authenticateOwner],
		},
		handlers.addDomain
	);

	fastify.post(
		"/:id/verify",
		{
			schema: schema.verifyDomainSchema,
			onRequest: [fastify.authenticateOwner],
		},
		handlers.verifyDomain
	);

	fastify.get(
		"/",
		{
			schema: schema.listDomainsSchema,
			onRequest: [fastify.authenticateOwner],
		},
		handlers.listDomains
	);

	fastify.get(
		"/:id",
		{
			schema: schema.getDomainSchema,
			onRequest: [fastify.authenticateOwner],
		},
		handlers.getDomain
	);

	fastify.put(
		"/:id",
		{
			schema: schema.updateDomainSettingsSchema,
			onRequest: [fastify.authenticateOwner],
		},
		handlers.updateDomainSettings
	);

	fastify.delete(
		"/:id",
		{
			schema: schema.deleteDomainSchema,
			onRequest: [fastify.authenticateOwner],
		},
		handlers.deleteDomain
	);

	fastify.post(
		"/:id/regenerate-code",
		{
			schema: schema.regenerateCodeSchema,
			onRequest: [fastify.authenticateOwner],
		},
		handlers.regenerateCode
	);
}
