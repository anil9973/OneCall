export const createToolSchema = {
	params: {
		type: "object",
		required: ["domainId"],
		properties: {
			domainId: { type: "string" },
		},
	},
	body: {
		type: "object",
		required: ["name", "type", "config"],
		properties: {
			name: { type: "string", minLength: 1, maxLength: 100 },
			description: { type: "string", maxLength: 500 },
			type: { type: "string", enum: ["http", "webhook", "mcp"] },
			enabled: { type: "boolean", default: true },
			config: { type: "object" },
		},
	},
	response: {
		200: {
			type: "object",
			properties: {
				id: { type: "string" },
				name: { type: "string" },
				type: { type: "string" },
			},
		},
	},
} as const;

export const listToolsSchema = {
	params: {
		type: "object",
		required: ["domainId"],
		properties: {
			domainId: { type: "string" },
		},
	},
	querystring: {
		type: "object",
		properties: {
			type: { type: "string", enum: ["http", "webhook", "mcp"] },
		},
	},
	response: {
		200: {
			type: "object",
			properties: {
				tools: { type: "array" },
			},
		},
	},
} as const;

export const getToolSchema = {
	params: {
		type: "object",
		required: ["domainId", "toolId"],
		properties: {
			domainId: { type: "string" },
			toolId: { type: "string" },
		},
	},
	response: {
		200: {
			type: "object",
			properties: {
				id: { type: "string" },
				name: { type: "string" },
				type: { type: "string" },
				config: { type: "object" },
			},
		},
	},
} as const;

export const updateToolSchema = {
	params: {
		type: "object",
		required: ["domainId", "toolId"],
		properties: {
			domainId: { type: "string" },
			toolId: { type: "string" },
		},
	},
	body: {
		type: "object",
		properties: {
			name: { type: "string" },
			description: { type: "string" },
			enabled: { type: "boolean" },
			config: { type: "object" },
		},
	},
	response: {
		200: {
			type: "object",
			properties: {
				success: { type: "boolean" },
			},
		},
	},
} as const;

export const deleteToolSchema = {
	params: {
		type: "object",
		required: ["domainId", "toolId"],
		properties: {
			domainId: { type: "string" },
			toolId: { type: "string" },
		},
	},
	response: {
		200: {
			type: "object",
			properties: {
				success: { type: "boolean" },
			},
		},
	},
} as const;

export const testToolSchema = {
	params: {
		type: "object",
		required: ["domainId", "toolId"],
		properties: {
			domainId: { type: "string" },
			toolId: { type: "string" },
		},
	},
	body: {
		type: "object",
		properties: {
			parameters: { type: "object" },
		},
	},
	response: {
		200: {
			type: "object",
			properties: {
				success: { type: "boolean" },
				statusCode: { type: "number" },
				responseTime: { type: "number" },
				response: {},
				error: { type: "string" },
			},
		},
	},
} as const;

export const createMCPServerSchema = {
	params: {
		type: "object",
		required: ["domainId"],
		properties: {
			domainId: { type: "string" },
		},
	},
	body: {
		type: "object",
		required: ["name", "serverUrl"],
		properties: {
			name: { type: "string", minLength: 1 },
			serverUrl: { type: "string", format: "uri" },
			authToken: { type: "string" },
			enabled: { type: "boolean", default: true },
		},
	},
	response: {
		200: {
			type: "object",
			properties: {
				id: { type: "string" },
				name: { type: "string" },
				tools: { type: "array" },
			},
		},
	},
} as const;

export const listMCPServersSchema = {
	params: {
		type: "object",
		required: ["domainId"],
		properties: {
			domainId: { type: "string" },
		},
	},
	response: {
		200: {
			type: "object",
			properties: {
				servers: { type: "array" },
			},
		},
	},
} as const;

export const getMCPToolsSchema = {
	params: {
		type: "object",
		required: ["domainId", "serverId"],
		properties: {
			domainId: { type: "string" },
			serverId: { type: "string" },
		},
	},
	response: {
		200: {
			type: "object",
			properties: {
				tools: { type: "array" },
			},
		},
	},
} as const;
