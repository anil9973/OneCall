import type { FastifyRequest, FastifyReply } from "fastify";
import type { ToolConfigService } from "../../services/tool-config.service.ts";
import type { ToolTesterService } from "../../services/tool-tester.service.ts";
import type { DomainVerificationService } from "../../services/domain-verification.service.ts";
import type { Tool, MCPServer, ToolType } from "../../types/tool-config.ts";

export class ToolConfigHandlers {
	private toolConfigService: ToolConfigService;
	private toolTesterService: ToolTesterService;
	private domainService: DomainVerificationService;

	constructor(
		toolConfigService: ToolConfigService,
		toolTesterService: ToolTesterService,
		domainService: DomainVerificationService
	) {
		this.toolConfigService = toolConfigService;
		this.toolTesterService = toolTesterService;
		this.domainService = domainService;
	}

	async createTool(
		request: FastifyRequest<{
			Params: { domainId: string };
			Body: Omit<Tool, "id" | "domainId" | "createdAt" | "updatedAt">;
		}>,
		reply: FastifyReply
	) {
		const ownerId = request.owner?.id;
		const { domainId } = request.params;

		if (!ownerId) return reply.code(401).send({ error: "Unauthorized" });

		const hasAccess = await this.verifyDomainAccess(ownerId, domainId);
		if (!hasAccess) return reply.code(403).send({ error: "Access denied" });

		const tool = await this.toolConfigService.createTool(domainId, request.body);

		return {
			id: tool.id,
			name: tool.name,
			type: tool.type,
			enabled: tool.enabled,
		};
	}

	async listTools(
		request: FastifyRequest<{ Params: { domainId: string }; Querystring: { type?: ToolType } }>,
		reply: FastifyReply
	) {
		const ownerId = request.owner?.id;
		const { domainId } = request.params;
		const { type } = request.query;

		if (!ownerId) return reply.code(401).send({ error: "Unauthorized" });

		const hasAccess = await this.verifyDomainAccess(ownerId, domainId);
		if (!hasAccess) return reply.code(403).send({ error: "Access denied" });

		const tools = await this.toolConfigService.listTools(domainId, type);

		return { tools };
	}

	async getTool(request: FastifyRequest<{ Params: { domainId: string; toolId: string } }>, reply: FastifyReply) {
		const ownerId = request.owner?.id;
		const { domainId, toolId } = request.params;

		if (!ownerId) return reply.code(401).send({ error: "Unauthorized" });

		const hasAccess = await this.verifyDomainAccess(ownerId, domainId);
		if (!hasAccess) return reply.code(403).send({ error: "Access denied" });

		const tool = await this.toolConfigService.getTool(domainId, toolId);

		if (!tool) return reply.code(404).send({ error: "Tool not found" });

		return tool;
	}

	async updateTool(
		request: FastifyRequest<{ Params: { domainId: string; toolId: string }; Body: Partial<Tool> }>,
		reply: FastifyReply
	) {
		const ownerId = request.owner?.id;
		const { domainId, toolId } = request.params;

		if (!ownerId) return reply.code(401).send({ error: "Unauthorized" });

		const hasAccess = await this.verifyDomainAccess(ownerId, domainId);
		if (!hasAccess) return reply.code(403).send({ error: "Access denied" });

		await this.toolConfigService.updateTool(domainId, toolId, request.body);

		return { success: true };
	}

	async deleteTool(request: FastifyRequest<{ Params: { domainId: string; toolId: string } }>, reply: FastifyReply) {
		const ownerId = request.owner?.id;
		const { domainId, toolId } = request.params;

		if (!ownerId) return reply.code(401).send({ error: "Unauthorized" });

		const hasAccess = await this.verifyDomainAccess(ownerId, domainId);
		if (!hasAccess) return reply.code(403).send({ error: "Access denied" });

		await this.toolConfigService.deleteTool(domainId, toolId);

		return { success: true };
	}

	async testTool(
		request: FastifyRequest<{
			Params: { domainId: string; toolId: string };
			Body: { parameters?: Record<string, unknown> };
		}>,
		reply: FastifyReply
	) {
		const ownerId = request.owner?.id;
		const { domainId, toolId } = request.params;
		const { parameters } = request.body;

		if (!ownerId) return reply.code(401).send({ error: "Unauthorized" });

		const hasAccess = await this.verifyDomainAccess(ownerId, domainId);
		if (!hasAccess) return reply.code(403).send({ error: "Access denied" });

		const tool = await this.toolConfigService.getTool(domainId, toolId);
		if (!tool) return reply.code(404).send({ error: "Tool not found" });

		let result;

		if (tool.type === "http") result = await this.toolTesterService.testHttpTool(tool.config as any, parameters);
		else if (tool.type === "webhook")
			result = await this.toolTesterService.testWebhook(tool.config as any, parameters);
		else return reply.code(400).send({ error: "Cannot test MCP tools directly" });

		return result;
	}

	async createMCPServer(
		request: FastifyRequest<{
			Params: { domainId: string };
			Body: Omit<MCPServer, "id" | "domainId" | "createdAt" | "updatedAt" | "tools">;
		}>,
		reply: FastifyReply
	) {
		const ownerId = request.owner?.id;
		const { domainId } = request.params;

		if (!ownerId) return reply.code(401).send({ error: "Unauthorized" });

		const hasAccess = await this.verifyDomainAccess(ownerId, domainId);
		if (!hasAccess) return reply.code(403).send({ error: "Access denied" });

		const healthResult = await this.toolTesterService.testMCPServer(request.body.serverUrl, request.body.authToken);

		if (!healthResult.success)
			return reply.code(400).send({
				error: "MCP server health check failed",
				details: healthResult.error,
			});

		let tools: string[] = [];
		try {
			tools = await this.toolTesterService.listMCPTools(request.body.serverUrl, request.body.authToken);
		} catch (error) {
			console.error("Failed to fetch MCP tools:", error);
		}

		const server = await this.toolConfigService.createMCPServer(domainId, {
			...request.body,
			tools,
			healthStatus: "healthy",
			lastHealthCheck: Date.now(),
		});

		return {
			id: server.id,
			name: server.name,
			tools: server.tools,
		};
	}

	async listMCPServers(request: FastifyRequest<{ Params: { domainId: string } }>, reply: FastifyReply) {
		const ownerId = request.owner?.id;
		const { domainId } = request.params;

		if (!ownerId) return reply.code(401).send({ error: "Unauthorized" });

		const hasAccess = await this.verifyDomainAccess(ownerId, domainId);
		if (!hasAccess) return reply.code(403).send({ error: "Access denied" });

		const servers = await this.toolConfigService.listMCPServers(domainId);

		return { servers };
	}

	async getMCPTools(
		request: FastifyRequest<{ Params: { domainId: string; serverId: string } }>,
		reply: FastifyReply
	) {
		const ownerId = request.owner?.id;
		const { domainId, serverId } = request.params;

		if (!ownerId) return reply.code(401).send({ error: "Unauthorized" });

		const hasAccess = await this.verifyDomainAccess(ownerId, domainId);
		if (!hasAccess) return reply.code(403).send({ error: "Access denied" });

		const server = await this.toolConfigService.getMCPServer(domainId, serverId);

		if (!server) return reply.code(404).send({ error: "MCP server not found" });

		try {
			const tools = await this.toolTesterService.listMCPTools(server.serverUrl, server.authToken);

			await this.toolConfigService.updateMCPServer(domainId, serverId, {
				tools,
				healthStatus: "healthy",
				lastHealthCheck: Date.now(),
			});

			return { tools };
		} catch (error) {
			await this.toolConfigService.updateMCPServer(domainId, serverId, {
				healthStatus: "unhealthy",
				lastHealthCheck: Date.now(),
			});

			return reply.code(503).send({
				error: "Failed to fetch MCP tools",
				details: error instanceof Error ? error.message : "Unknown error",
			});
		}
	}

	private async verifyDomainAccess(ownerId: string, domainId: string): Promise<boolean> {
		const domain = await this.domainService.getDomain(domainId);
		return domain?.ownerId === ownerId && domain?.verified === true;
	}
}
