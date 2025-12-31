import type { FastifyInstance } from "fastify";
import { ToolConfigHandlers } from "./handlers.ts";
import * as schema from "./schema.ts";

export async function toolConfigRoutes(fastify: FastifyInstance) {
	const handlers = new ToolConfigHandlers(
		fastify.toolConfigService,
		fastify.toolTesterService,
		fastify.domainVerificationService
	);

	fastify.post(
		"/:domainId/tools",
		{
			schema: schema.createToolSchema,
			onRequest: [fastify.authenticateOwner],
		},
		handlers.createTool.bind(handlers)
	);

	fastify.get(
		"/:domainId/tools",
		{
			schema: schema.listToolsSchema,
			onRequest: [fastify.authenticateOwner],
		},
		handlers.listTools.bind(handlers)
	);

	fastify.get(
		"/:domainId/tools/:toolId",
		{
			schema: schema.getToolSchema,
			onRequest: [fastify.authenticateOwner],
		},
		handlers.getTool.bind(handlers)
	);

	fastify.put(
		"/:domainId/tools/:toolId",
		{
			schema: schema.updateToolSchema,
			onRequest: [fastify.authenticateOwner],
		},
		handlers.updateTool.bind(handlers)
	);

	fastify.delete(
		"/:domainId/tools/:toolId",
		{
			schema: schema.deleteToolSchema,
			onRequest: [fastify.authenticateOwner],
		},
		handlers.deleteTool.bind(handlers)
	);

	fastify.post(
		"/:domainId/tools/:toolId/test",
		{
			schema: schema.testToolSchema,
			onRequest: [fastify.authenticateOwner],
		},
		handlers.testTool.bind(handlers)
	);

	fastify.post(
		"/:domainId/mcp",
		{
			schema: schema.createMCPServerSchema,
			onRequest: [fastify.authenticateOwner],
		},
		handlers.createMCPServer.bind(handlers)
	);

	fastify.get(
		"/:domainId/mcp",
		{
			schema: schema.listMCPServersSchema,
			onRequest: [fastify.authenticateOwner],
		},
		handlers.listMCPServers.bind(handlers)
	);

	fastify.get(
		"/:domainId/mcp/:serverId/tools",
		{
			schema: schema.getMCPToolsSchema,
			onRequest: [fastify.authenticateOwner],
		},
		handlers.getMCPTools.bind(handlers)
	);
}
