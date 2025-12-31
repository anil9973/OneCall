export const registerToolsRequestSchema = {
	type: "object",
	properties: {
		agentId: { type: "string" },
		toolNames: {
			type: "array",
			items: { type: "string" },
		},
	},
} as const;

export const registerToolsResponseSchema = {
	type: "object",
	required: ["success", "registered", "failed"],
	properties: {
		success: { type: "boolean" },
		registered: { type: "number" },
		failed: { type: "number" },
		errors: {
			type: "array",
			items: { type: "string" },
		},
	},
} as const;
