export const uploadDocumentSchema = {
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
				id: { type: "string" },
				title: { type: "string" },
				status: { type: "string" },
				jobId: { type: "string" },
			},
		},
	},
} as const;

export const addFAQSchema = {
	params: {
		type: "object",
		required: ["domainId"],
		properties: {
			domainId: { type: "string" },
		},
	},
	body: {
		type: "object",
		required: ["question", "answer"],
		properties: {
			question: { type: "string", minLength: 5 },
			answer: { type: "string", minLength: 10 },
			category: { type: "string" },
		},
	},
	response: {
		200: {
			type: "object",
			properties: {
				id: { type: "string" },
				question: { type: "string" },
				answer: { type: "string" },
			},
		},
	},
} as const;

export const scrapeURLSchema = {
	params: {
		type: "object",
		required: ["domainId"],
		properties: {
			domainId: { type: "string" },
		},
	},
	body: {
		type: "object",
		required: ["url", "title"],
		properties: {
			url: { type: "string", format: "uri" },
			title: { type: "string", minLength: 1 },
		},
	},
	response: {
		200: {
			type: "object",
			properties: {
				id: { type: "string" },
				title: { type: "string" },
				jobId: { type: "string" },
			},
		},
	},
} as const;

export const listDocumentsSchema = {
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
				documents: {
					type: "array",
					items: {
						type: "object",
						properties: {
							id: { type: "string" },
							title: { type: "string" },
							type: { type: "string" },
							status: { type: "string" },
							chunkCount: { type: "number" },
							uploadedAt: { type: "number" },
						},
					},
				},
			},
		},
	},
} as const;

export const getDocumentSchema = {
	params: {
		type: "object",
		required: ["domainId", "docId"],
		properties: {
			domainId: { type: "string" },
			docId: { type: "string" },
		},
	},
	response: {
		200: {
			type: "object",
			properties: {
				id: { type: "string" },
				title: { type: "string" },
				type: { type: "string" },
				status: { type: "string" },
				chunkCount: { type: "number" },
				metadata: { type: "object" },
			},
		},
	},
} as const;

export const deleteDocumentSchema = {
	params: {
		type: "object",
		required: ["domainId", "docId"],
		properties: {
			domainId: { type: "string" },
			docId: { type: "string" },
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

export const searchKnowledgeSchema = {
	params: {
		type: "object",
		required: ["domainId"],
		properties: {
			domainId: { type: "string" },
		},
	},
	body: {
		type: "object",
		required: ["query"],
		properties: {
			query: { type: "string", minLength: 3 },
			limit: { type: "number", minimum: 1, maximum: 20, default: 5 },
			threshold: { type: "number", minimum: 0, maximum: 1, default: 0.7 },
		},
	},
	response: {
		200: {
			type: "object",
			properties: {
				results: {
					type: "array",
					items: {
						type: "object",
						properties: {
							content: { type: "string" },
							score: { type: "number" },
							type: { type: "string" },
							metadata: { type: "object" },
						},
					},
				},
			},
		},
	},
} as const;

export const getJobStatusSchema = {
	params: {
		type: "object",
		required: ["jobId"],
		properties: {
			jobId: { type: "string" },
		},
	},
	response: {
		200: {
			type: "object",
			properties: {
				id: { type: "string" },
				status: { type: "string" },
				progress: { type: "number" },
				error: { type: "string" },
			},
		},
	},
} as const;
