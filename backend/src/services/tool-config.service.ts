import type { Firestore } from "firebase-admin/firestore";
import type { Tool, MCPServer, ToolType } from "../types/tool-config.ts";
import { nanoid } from "nanoid";

export class ToolConfigService {
	private firestore: Firestore;

	constructor(firestore: Firestore) {
		this.firestore = firestore;
	}

	async createTool(
		domainId: string,
		toolData: Omit<Tool, "id" | "domainId" | "createdAt" | "updatedAt">
	): Promise<Tool> {
		const tool: Tool = {
			id: nanoid(21),
			domainId,
			...toolData,
			createdAt: Date.now(),
			updatedAt: Date.now(),
		};

		await this.firestore
			.collection("domains")
			.doc(domainId)
			.collection("tools")
			.doc(tool.id)
			.set({
				...tool,
				createdAt: new Date(tool.createdAt),
				updatedAt: new Date(tool.updatedAt),
			});

		return tool;
	}

	async getTool(domainId: string, toolId: string): Promise<Tool | null> {
		const doc = await this.firestore.collection("domains").doc(domainId).collection("tools").doc(toolId).get();

		if (!doc.exists) return null;

		const data = doc.data();
		if (!data) return null;

		return {
			id: doc.id,
			domainId: data.domainId,
			name: data.name,
			description: data.description,
			type: data.type,
			enabled: data.enabled,
			config: data.config,
			createdAt: data.createdAt.toMillis(),
			updatedAt: data.updatedAt.toMillis(),
		};
	}

	async listTools(domainId: string, type?: ToolType): Promise<Tool[]> {
		let query = this.firestore.collection("domains").doc(domainId).collection("tools") as any;

		type && (query = query.where("type", "==", type));

		const snapshot = await query.orderBy("createdAt", "desc").get();

		return snapshot.docs.map((doc: any) => {
			const data = doc.data();
			return {
				id: doc.id,
				domainId: data.domainId,
				name: data.name,
				description: data.description,
				type: data.type,
				enabled: data.enabled,
				config: data.config,
				createdAt: data.createdAt.toMillis(),
				updatedAt: data.updatedAt.toMillis(),
			};
		});
	}

	async updateTool(domainId: string, toolId: string, updates: Partial<Tool>): Promise<void> {
		const updateData: Record<string, unknown> = {
			updatedAt: new Date(),
		};

		updates.name && (updateData.name = updates.name);
		updates.description && (updateData.description = updates.description);
		updates.enabled !== undefined && (updateData.enabled = updates.enabled);
		updates.config && (updateData.config = updates.config);

		await this.firestore.collection("domains").doc(domainId).collection("tools").doc(toolId).update(updateData);
	}

	async deleteTool(domainId: string, toolId: string): Promise<void> {
		await this.firestore.collection("domains").doc(domainId).collection("tools").doc(toolId).delete();
	}

	async createMCPServer(
		domainId: string,
		serverData: Omit<MCPServer, "id" | "domainId" | "createdAt" | "updatedAt">
	): Promise<MCPServer> {
		const server: MCPServer = {
			id: nanoid(21),
			domainId,
			...serverData,
			createdAt: Date.now(),
			updatedAt: Date.now(),
		};

		await this.firestore
			.collection("domains")
			.doc(domainId)
			.collection("mcp_servers")
			.doc(server.id)
			.set({
				...server,
				createdAt: new Date(server.createdAt),
				updatedAt: new Date(server.updatedAt),
			});

		return server;
	}

	async getMCPServer(domainId: string, serverId: string): Promise<MCPServer | null> {
		const doc = await this.firestore
			.collection("domains")
			.doc(domainId)
			.collection("mcp_servers")
			.doc(serverId)
			.get();

		if (!doc.exists) return null;

		const data = doc.data();
		if (!data) return null;

		return {
			id: doc.id,
			domainId: data.domainId,
			name: data.name,
			serverUrl: data.serverUrl,
			authToken: data.authToken,
			tools: data.tools,
			enabled: data.enabled,
			createdAt: data.createdAt.toMillis(),
			updatedAt: data.updatedAt.toMillis(),
			lastHealthCheck: data.lastHealthCheck?.toMillis(),
			healthStatus: data.healthStatus,
		};
	}

	async listMCPServers(domainId: string): Promise<MCPServer[]> {
		const snapshot = await this.firestore
			.collection("domains")
			.doc(domainId)
			.collection("mcp_servers")
			.orderBy("createdAt", "desc")
			.get();

		return snapshot.docs.map((doc) => {
			const data = doc.data();
			return {
				id: doc.id,
				domainId: data.domainId,
				name: data.name,
				serverUrl: data.serverUrl,
				authToken: data.authToken,
				tools: data.tools,
				enabled: data.enabled,
				createdAt: data.createdAt.toMillis(),
				updatedAt: data.updatedAt.toMillis(),
				lastHealthCheck: data.lastHealthCheck?.toMillis(),
				healthStatus: data.healthStatus,
			};
		});
	}

	async updateMCPServer(domainId: string, serverId: string, updates: Partial<MCPServer>): Promise<void> {
		const updateData: Record<string, unknown> = {
			updatedAt: new Date(),
		};

		updates.name && (updateData.name = updates.name);
		updates.serverUrl && (updateData.serverUrl = updates.serverUrl);
		updates.authToken !== undefined && (updateData.authToken = updates.authToken);
		updates.tools && (updateData.tools = updates.tools);
		updates.enabled !== undefined && (updateData.enabled = updates.enabled);
		updates.healthStatus && (updateData.healthStatus = updates.healthStatus);
		updates.lastHealthCheck && (updateData.lastHealthCheck = new Date(updates.lastHealthCheck));

		await this.firestore
			.collection("domains")
			.doc(domainId)
			.collection("mcp_servers")
			.doc(serverId)
			.update(updateData);
	}

	async deleteMCPServer(domainId: string, serverId: string): Promise<void> {
		await this.firestore.collection("domains").doc(domainId).collection("mcp_servers").doc(serverId).delete();
	}
}
