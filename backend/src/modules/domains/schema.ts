export const addDomainSchema = {
	body: {
		type: "object",
		required: ["domain"],
		properties: {
			domain: { type: "string", minLength: 3 },
		},
	},
	response: {
		200: {
			type: "object",
			properties: {
				id: { type: "string" },
				domain: { type: "string" },
				verificationCode: { type: "string" },
				verificationMethods: { type: "array" },
			},
		},
	},
} as const;

export const verifyDomainSchema = {
	params: {
		type: "object",
		required: ["id"],
		properties: {
			id: { type: "string" },
		},
	},
	body: {
		type: "object",
		required: ["method"],
		properties: {
			method: { type: "string", enum: ["dns", "html_meta", "file_upload"] },
		},
	},
	response: {
		200: {
			type: "object",
			properties: {
				verified: { type: "boolean" },
				verifiedAt: { type: "number" },
			},
		},
	},
} as const;

export const listDomainsSchema = {
	response: {
		200: {
			type: "object",
			properties: {
				domains: {
					type: "array",
					items: {
						type: "object",
						properties: {
							id: { type: "string" },
							domain: { type: "string" },
							verified: { type: "boolean" },
							createdAt: { type: "number" },
						},
					},
				},
			},
		},
	},
} as const;

export const getDomainSchema = {
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
				domain: { type: "string" },
				verified: { type: "boolean" },
				verificationCode: { type: "string" },
				settings: { type: "object" },
			},
		},
	},
} as const;

export const updateDomainSettingsSchema = {
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
			allowEscalation: { type: "boolean" },
			workingHours: { type: "object" },
			voiceId: { type: "string" },
			autoEscalateKeywords: {
				type: "array",
				items: { type: "string" },
			},
			maxAIDuration: { type: "number", minimum: 60, maximum: 3600 },
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

export const deleteDomainSchema = {
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
				success: { type: "boolean" },
			},
		},
	},
} as const;

export const regenerateCodeSchema = {
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
				verificationCode: { type: "string" },
			},
		},
	},
} as const;
