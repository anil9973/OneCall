export type ToolType = "http" | "webhook" | "mcp";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface HttpToolConfig {
	method: HttpMethod;
	url: string;
	headers?: Record<string, string>;
	parameters?: ToolParameter[];
	timeout?: number;
	authType?: "none" | "bearer" | "basic" | "api_key";
	authValue?: string;
}

export interface WebhookConfig {
	url: string;
	method: HttpMethod;
	secret?: string;
	parameters?: ToolParameter[];
	retryAttempts?: number;
	retryDelay?: number;
}

export interface MCPServerConfig {
	serverUrl: string;
	authToken?: string;
	tools: string[];
	timeout?: number;
}

export interface ToolParameter {
	name: string;
	type: "string" | "number" | "boolean" | "object" | "array";
	required: boolean;
	description?: string;
	default?: unknown;
}

export interface Tool {
	id: string;
	domainId: string;
	name: string;
	description: string;
	type: ToolType;
	enabled: boolean;
	config: HttpToolConfig | WebhookConfig | MCPServerConfig;
	createdAt: number;
	updatedAt: number;
}

export interface MCPServer {
	id: string;
	domainId: string;
	name: string;
	serverUrl: string;
	authToken?: string;
	tools: string[];
	enabled: boolean;
	createdAt: number;
	updatedAt: number;
	lastHealthCheck?: number;
	healthStatus?: "healthy" | "unhealthy" | "unknown";
}

export interface ToolTestResult {
	success: boolean;
	statusCode?: number;
	responseTime: number;
	response?: unknown;
	error?: string;
}
