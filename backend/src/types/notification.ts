export type NotificationType = "call_started" | "escalation_requested" | "new_message" | "call_ended";

export type NotificationPriority = "high" | "normal" | "low";

export interface PushSubscription {
	id: string;
	ownerId: string;
	token: string;
	deviceType: "web" | "android" | "ios";
	userAgent?: string;
	createdAt: number;
	lastUsed?: number;
}

export interface Notification {
	id: string;
	ownerId: string;
	type: NotificationType;
	title: string;
	body: string;
	data: Record<string, string>;
	priority: NotificationPriority;
	createdAt: number;
	sentAt?: number;
	deliveredAt?: number;
	clickedAt?: number;
	status: "pending" | "sent" | "delivered" | "clicked" | "failed";
	error?: string;
}

export interface NotificationPayload {
	title: string;
	body: string;
	icon?: string;
	badge?: string;
	image?: string;
	data?: Record<string, string>;
	tag?: string;
	requireInteraction?: boolean;
	actions?: Array<{
		action: string;
		title: string;
		icon?: string;
	}>;
}

export interface SendNotificationRequest {
	ownerId: string;
	type: NotificationType;
	title: string;
	body: string;
	data?: Record<string, string>;
	priority?: NotificationPriority;
	tag?: string;
	requireInteraction?: boolean;
}
