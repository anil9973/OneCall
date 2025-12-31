import type { HttpToolConfig, WebhookConfig, ToolTestResult } from "../types/tool-config.ts";
import crypto from "crypto";

export class ToolTesterService {
	async testHttpTool(config: HttpToolConfig, params?: Record<string, unknown>): Promise<ToolTestResult> {
		const startTime = Date.now();

		try {
			let url = config.url;

			if (params && config.method === "GET") {
				const queryParams = new URLSearchParams();
				Object.entries(params).forEach(([key, value]) => {
					queryParams.append(key, String(value));
				});
				url = `${url}?${queryParams.toString()}`;
			}

			const headers: Record<string, string> = {
				"Content-Type": "application/json",
				...config.headers,
			};

			if (config.authType === "bearer" && config.authValue) headers["Authorization"] = `Bearer ${config.authValue}`;
			else if (config.authType === "api_key" && config.authValue) headers["X-API-Key"] = config.authValue;

			const options: RequestInit = {
				method: config.method,
				headers,
				signal: AbortSignal.timeout(config.timeout || 10000),
			};

			if (config.method !== "GET" && params) options.body = JSON.stringify(params);

			const response = await fetch(url, options);
			const responseTime = Date.now() - startTime;

			let responseData;
			const contentType = response.headers.get("content-type");

			if (contentType?.includes("application/json")) {
				responseData = await response.json();
			} else {
				responseData = await response.text();
			}

			return {
				success: response.ok,
				statusCode: response.status,
				responseTime,
				response: responseData,
			};
		} catch (error) {
			const responseTime = Date.now() - startTime;
			return {
				success: false,
				responseTime,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	async testWebhook(config: WebhookConfig, params?: Record<string, unknown>): Promise<ToolTestResult> {
		const startTime = Date.now();

		try {
			const body = JSON.stringify(params || {});
			const headers: Record<string, string> = {
				"Content-Type": "application/json",
			};

			if (config.secret) {
				const signature = crypto.createHmac("sha256", config.secret).update(body).digest("hex");
				headers["X-Webhook-Signature"] = signature;
			}

			const response = await fetch(config.url, {
				method: config.method,
				headers,
				body,
				signal: AbortSignal.timeout(10000),
			});

			const responseTime = Date.now() - startTime;
			const responseData = await response.text();

			return {
				success: response.ok,
				statusCode: response.status,
				responseTime,
				response: responseData,
			};
		} catch (error) {
			const responseTime = Date.now() - startTime;
			return {
				success: false,
				responseTime,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	async testMCPServer(serverUrl: string, authToken?: string): Promise<ToolTestResult> {
		const startTime = Date.now();

		try {
			const headers: Record<string, string> = {
				"Content-Type": "application/json",
			};

			authToken && (headers["Authorization"] = `Bearer ${authToken}`);

			const response = await fetch(`${serverUrl}/health`, {
				method: "GET",
				headers,
				signal: AbortSignal.timeout(5000),
			});

			const responseTime = Date.now() - startTime;

			if (!response.ok) {
				return {
					success: false,
					statusCode: response.status,
					responseTime,
					error: "Health check failed",
				};
			}

			const data = await response.json();

			return {
				success: true,
				statusCode: response.status,
				responseTime,
				response: data,
			};
		} catch (error) {
			const responseTime = Date.now() - startTime;
			return {
				success: false,
				responseTime,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	async listMCPTools(serverUrl: string, authToken?: string): Promise<string[]> {
		const headers: Record<string, string> = {
			"Content-Type": "application/json",
		};

		authToken && (headers["Authorization"] = `Bearer ${authToken}`);

		const response = await fetch(`${serverUrl}/tools`, {
			method: "GET",
			headers,
			signal: AbortSignal.timeout(5000),
		});

		if (!response.ok) throw new Error("Failed to fetch MCP tools");

		const data = await response.json();
		return data.tools || [];
	}
}
