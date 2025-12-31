export const startCallSchema = {
	body: {
		type: "object",
		required: ["domain", "userId", "pageUrl"],
		properties: {
			domain: { type: "string", minLength: 1 },
			userId: { type: "string", minLength: 1 },
			pageUrl: { type: "string", format: "uri" },
			metadata: { type: "object" },
		},
	},
	response: {
		200: {
			type: "object",
			properties: {
				sessionId: { type: "string" },
				token: { type: "string" },
				status: { type: "string" },
			},
		},
	},
} as const;

export const escalateCallSchema = {
	body: {
		type: "object",
		required: ["sessionId", "reason"],
		properties: {
			sessionId: { type: "string" },
			reason: { type: "string" },
			metadata: { type: "object" },
		},
	},
	response: {
		200: {
			type: "object",
			properties: {
				success: { type: "boolean" },
				ownerId: { type: "string" },
				ownerOnline: { type: "boolean" },
			},
		},
	},
} as const;

export const acceptCallSchema = {
	body: {
		type: "object",
		required: ["sessionId"],
		properties: {
			sessionId: { type: "string" },
		},
	},
	response: {
		200: {
			type: "object",
			properties: {
				success: { type: "boolean" },
				session: { type: "object" },
			},
		},
	},
} as const;

export const endCallSchema = {
	body: {
		type: "object",
		required: ["sessionId"],
		properties: {
			sessionId: { type: "string" },
			reason: { type: "string" },
			duration: { type: "number" },
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

export const getActiveCallsSchema = {
	querystring: {
		type: "object",
		properties: {
			domain: { type: "string" },
			limit: { type: "number", minimum: 1, maximum: 100, default: 20 },
		},
	},
	response: {
		200: {
			type: "object",
			properties: {
				calls: {
					type: "array",
					items: {
						type: "object",
						properties: {
							sessionId: { type: "string" },
							domain: { type: "string" },
							status: { type: "string" },
							startedAt: { type: "string" },
							userId: { type: "string" },
						},
					},
				},
				total: { type: "number" },
			},
		},
	},
} as const;
