export const signupSchema = {
	body: {
		type: "object",
		required: ["email", "password", "name"],
		properties: {
			email: { type: "string", format: "email" },
			password: { type: "string", minLength: 8 },
			name: { type: "string", minLength: 1 },
			company: { type: "string" },
		},
	},
	response: {
		200: {
			type: "object",
			properties: {
				owner: {
					type: "object",
					properties: {
						id: { type: "string" },
						email: { type: "string" },
						name: { type: "string" },
						plan: { type: "string" },
					},
				},
				token: { type: "string" },
			},
		},
	},
} as const;

export const loginSchema = {
	body: {
		type: "object",
		required: ["email", "password"],
		properties: {
			email: { type: "string", format: "email" },
			password: { type: "string" },
		},
	},
	response: {
		200: {
			type: "object",
			properties: {
				owner: { type: "object" },
				token: { type: "string" },
			},
		},
	},
} as const;

export const refreshTokenSchema = {
	body: {
		type: "object",
		required: ["firebaseToken"],
		properties: {
			firebaseToken: { type: "string" },
		},
	},
	response: {
		200: {
			type: "object",
			properties: {
				token: { type: "string" },
			},
		},
	},
} as const;

export const getMeSchema = {
	response: {
		200: {
			type: "object",
			properties: {
				id: { type: "string" },
				email: { type: "string" },
				name: { type: "string" },
				company: { type: "string" },
				plan: { type: "string" },
				emailVerified: { type: "boolean" },
			},
		},
	},
} as const;

export const updateProfileSchema = {
	body: {
		type: "object",
		properties: {
			name: { type: "string", minLength: 1 },
			company: { type: "string" },
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
