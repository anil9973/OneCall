export const conversationTokenRequestSchema = {
	type: "object",
	properties: {
		websiteType: {
			type: "string",
			enum: [
				"shopping",
				"finance",
				"entertainment",
				"learning",
				"programming",
				"news",
				"research",
				"social-media",
				"productivity",
				"documentation",
				"base",
			],
		},
		userContext: {
			type: "object",
			properties: {
				gender: { type: "string", enum: ["male", "female", "neutral"] },
				ageGroup: { type: "string", enum: ["young", "adult", "senior"] },
				language: { type: "string" },
				country: { type: "string" },
			},
		},
	},
} as const;

export const conversationTokenResponseSchema = {
	type: "object",
	required: ["token", "agentId", "voiceId", "expiresIn"],
	properties: {
		token: { type: "string" },
		agentId: { type: "string" },
		voiceId: { type: "string" },
		expiresIn: { type: "number" },
	},
} as const;

export const startConversationSchema = {
	body: {
		type: "object",
		required: ["sessionId", "domain", "userId"],
		properties: {
			sessionId: { type: "string" },
			domain: { type: "string" },
			userId: { type: "string" },
			ownerId: { type: "string" },
			metadata: { type: "object" },
		},
	},
	response: {
		200: {
			type: "object",
			properties: {
				id: { type: "string" },
				sessionId: { type: "string" },
				status: { type: "string" },
			},
		},
	},
} as const;

export const addMessageSchema = {
	params: {
		type: "object",
		required: ["id"],
		properties: {
			id: { type: "string" },
		},
	},
	body: {
		type: "object",
		required: ["role", "content", "timestamp"],
		properties: {
			role: { type: "string", enum: ["user", "assistant", "system"] },
			content: { type: "string", minLength: 1 },
			timestamp: { type: "number" },
			audioUrl: { type: "string", format: "uri" },
			duration: { type: "number" },
			toolCalls: { type: "array", items: { type: "string" } },
			metadata: { type: "object" },
		},
	},
	response: {
		200: {
			type: "object",
			properties: {
				id: { type: "string" },
				role: { type: "string" },
				content: { type: "string" },
				timestamp: { type: "number" },
			},
		},
	},
} as const;

export const endConversationSchema = {
	params: {
		type: "object",
		required: ["id"],
		properties: {
			id: { type: "string" },
		},
	},
	body: {
		type: "object",
		properties: {
			resolution: { type: "string" },
			rating: { type: "number", minimum: 1, maximum: 5 },
			duration: { type: "number", minimum: 0 },
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

export const getConversationSchema = {
	params: {
		type: "object",
		required: ["id"],
		properties: {
			id: { type: "string" },
		},
	},
	response: {
		200: {
			type: "object",
			properties: {
				id: { type: "string" },
				sessionId: { type: "string" },
				domain: { type: "string" },
				status: { type: "string" },
				messages: { type: "array" },
				metrics: { type: "object" },
			},
		},
	},
} as const;

export const listConversationsSchema = {
	querystring: {
		type: "object",
		properties: {
			domain: { type: "string" },
			status: { type: "string", enum: ["active", "ended", "archived"] },
			startDate: { type: "number" },
			endDate: { type: "number" },
			escalated: { type: "boolean" },
			limit: { type: "number", minimum: 1, maximum: 100, default: 20 },
			offset: { type: "number", minimum: 0, default: 0 },
		},
	},
	response: {
		200: {
			type: "object",
			properties: {
				conversations: { type: "array" },
				total: { type: "number" },
			},
		},
	},
} as const;

export const searchConversationsSchema = {
	querystring: {
		type: "object",
		required: ["query"],
		properties: {
			query: { type: "string", minLength: 1 },
			domain: { type: "string" },
			limit: { type: "number", minimum: 1, maximum: 100, default: 20 },
		},
	},
	response: {
		200: {
			type: "object",
			properties: {
				conversations: { type: "array" },
				total: { type: "number" },
			},
		},
	},
} as const;
