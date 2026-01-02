import { apiClient } from "../client.js";
import type { Tool } from "../types/backend-types.js";

class ToolService {
	async list(domainId: string, type?: "http" | "webhook" | "mcp"): Promise<Tool[]> {
		const response = await apiClient.get<{ tools: Tool[] }>(
			`/tool-config/${domainId}/tools`,
			type ? { type } : undefined
		);
		return response.tools;
	}

	async get(domainId: string, toolId: string): Promise<Tool> {
		return apiClient.get<Tool>(`/tool-config/${domainId}/tools/${toolId}`);
	}

	async create(
		domainId: string,
		data: {
			name: string;
			description: string;
			type: "http" | "webhook" | "mcp";
			enabled: boolean;
			config: unknown;
		}
	): Promise<{ id: string }> {
		return apiClient.post(`/tool-config/${domainId}/tools`, data);
	}

	async update(domainId: string, toolId: string, data: Partial<Tool>): Promise<void> {
		await apiClient.put(`/tool-config/${domainId}/tools/${toolId}`, data);
	}

	async delete(domainId: string, toolId: string): Promise<void> {
		await apiClient.delete(`/tool-config/${domainId}/tools/${toolId}`);
	}

	async test(
		domainId: string,
		toolId: string,
		parameters?: Record<string, unknown>
	): Promise<{
		success: boolean;
		statusCode?: number;
		responseTime: number;
		response?: unknown;
		error?: string;
	}> {
		return apiClient.post(`/tool-config/${domainId}/tools/${toolId}/test`, { parameters });
	}
}

export const toolService = new ToolService();
