export const subscribeSchema = {
	body: {
		type: "object",
		required: ["token", "deviceType"],
		properties: {
			token: { type: "string", minLength: 10 },
			deviceType: { type: "string", enum: ["web", "android", "ios"] },
			userAgent: { type: "string" },
		},
	},
	response: {
		200: {
			type: "object",
			properties: {
				id: { type: "string" },
				success: { type: "boolean" },
			},
		},
	},
} as const;

export const unsubscribeSchema = {
	params: {
		type: "object",
		required: ["subscriptionId"],
		properties: {
			subscriptionId: { type: "string" },
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

export const listSubscriptionsSchema = {
	response: {
		200: {
			type: "object",
			properties: {
				subscriptions: {
					type: "array",
					items: {
						type: "object",
						properties: {
							id: { type: "string" },
							deviceType: { type: "string" },
							createdAt: { type: "number" },
							lastUsed: { type: "number" },
						},
					},
				},
			},
		},
	},
} as const;

export const sendNotificationSchema = {
	body: {
		type: "object",
		required: ["title", "body", "type"],
		properties: {
			title: { type: "string", minLength: 1, maxLength: 100 },
			body: { type: "string", minLength: 1, maxLength: 500 },
			type: { type: "string", enum: ["call_started", "escalation_requested", "new_message", "call_ended"] },
			priority: { type: "string", enum: ["high", "normal", "low"], default: "normal" },
			data: { type: "object" },
			tag: { type: "string" },
			requireInteraction: { type: "boolean", default: false },
		},
	},
	response: {
		200: {
			type: "object",
			properties: {
				id: { type: "string" },
				status: { type: "string" },
			},
		},
	},
} as const;

export const testNotificationSchema = {
	response: {
		200: {
			type: "object",
			properties: {
				id: { type: "string" },
				status: { type: "string" },
				message: { type: "string" },
			},
		},
	},
} as const;

export const listNotificationsSchema = {
	querystring: {
		type: "object",
		properties: {
			limit: { type: "number", minimum: 1, maximum: 100, default: 50 },
		},
	},
	response: {
		200: {
			type: "object",
			properties: {
				notifications: { type: "array" },
			},
		},
	},
} as const;

export const markClickedSchema = {
	params: {
		type: "object",
		required: ["notificationId"],
		properties: {
			notificationId: { type: "string" },
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
