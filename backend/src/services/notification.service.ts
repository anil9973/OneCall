import type { Messaging } from "firebase-admin/messaging";
import type { Firestore } from "firebase-admin/firestore";
import type {
	PushSubscription,
	Notification,
	NotificationPayload,
	SendNotificationRequest,
} from "../types/notification.ts";
import { nanoid } from "nanoid";

export class NotificationService {
	private messaging: Messaging;
	private firestore: Firestore;

	constructor(messaging: Messaging, firestore: Firestore) {
		this.messaging = messaging;
		this.firestore = firestore;
	}

	async subscribeToPush(
		ownerId: string,
		token: string,
		deviceType: "web" | "android" | "ios",
		userAgent?: string
	): Promise<PushSubscription> {
		const existing = await this.getSubscriptionByToken(token);

		if (existing) {
			await this.updateSubscription(existing.id, {
				lastUsed: Date.now(),
			});
			return existing;
		}

		const subscription: PushSubscription = {
			id: nanoid(21),
			ownerId,
			token,
			deviceType,
			userAgent,
			createdAt: Date.now(),
		};

		await this.firestore
			.collection("push_subscriptions")
			.doc(subscription.id)
			.set({
				...subscription,
				createdAt: new Date(subscription.createdAt),
			});

		return subscription;
	}

	async unsubscribeFromPush(subscriptionId: string): Promise<void> {
		await this.firestore.collection("push_subscriptions").doc(subscriptionId).delete();
	}

	async unsubscribeByToken(token: string): Promise<void> {
		const subscription = await this.getSubscriptionByToken(token);

		if (subscription) await this.unsubscribeFromPush(subscription.id);
	}

	async getSubscriptionByToken(token: string): Promise<PushSubscription | null> {
		const snapshot = await this.firestore.collection("push_subscriptions").where("token", "==", token).limit(1).get();

		if (snapshot.empty) return null;

		const doc = snapshot.docs[0];
		const data = doc.data();

		return {
			id: doc.id,
			ownerId: data.ownerId,
			token: data.token,
			deviceType: data.deviceType,
			userAgent: data.userAgent,
			createdAt: data.createdAt.toMillis(),
			lastUsed: data.lastUsed?.toMillis(),
		};
	}

	async listSubscriptions(ownerId: string): Promise<PushSubscription[]> {
		const snapshot = await this.firestore
			.collection("push_subscriptions")
			.where("ownerId", "==", ownerId)
			.orderBy("createdAt", "desc")
			.get();

		return snapshot.docs.map((doc) => {
			const data = doc.data();
			return {
				id: doc.id,
				ownerId: data.ownerId,
				token: data.token,
				deviceType: data.deviceType,
				userAgent: data.userAgent,
				createdAt: data.createdAt.toMillis(),
				lastUsed: data.lastUsed?.toMillis(),
			};
		});
	}

	async updateSubscription(subscriptionId: string, updates: Partial<PushSubscription>): Promise<void> {
		const updateData: Record<string, unknown> = {};

		updates.lastUsed && (updateData.lastUsed = new Date(updates.lastUsed));

		await this.firestore.collection("push_subscriptions").doc(subscriptionId).update(updateData);
	}

	async sendNotification(request: SendNotificationRequest): Promise<Notification> {
		const notification: Notification = {
			id: nanoid(21),
			ownerId: request.ownerId,
			type: request.type,
			title: request.title,
			body: request.body,
			data: request.data || {},
			priority: request.priority || "normal",
			createdAt: Date.now(),
			status: "pending",
		};

		await this.firestore
			.collection("notifications")
			.doc(notification.id)
			.set({
				...notification,
				createdAt: new Date(notification.createdAt),
			});

		const subscriptions = await this.listSubscriptions(request.ownerId);

		if (subscriptions.length === 0) {
			await this.updateNotificationStatus(notification.id, "failed", "No subscriptions found");
			return notification;
		}

		const tokens = subscriptions.map((s) => s.token);

		try {
			const message = {
				notification: {
					title: request.title,
					body: request.body,
				},
				data: request.data || {},
				webpush: request.tag
					? {
							notification: {
								tag: request.tag,
								requireInteraction: request.requireInteraction || false,
							},
					  }
					: undefined,
				android: {
					priority: request.priority === "high" ? "high" : "normal",
				},
				apns: {
					payload: {
						aps: {
							sound: "default",
							badge: 1,
						},
					},
				},
				tokens,
			};

			const response = await this.messaging.sendEachForMulticast(message);

			await this.updateNotificationStatus(
				notification.id,
				response.successCount > 0 ? "sent" : "failed",
				response.successCount === 0 ? "All sends failed" : undefined,
				Date.now()
			);

			const failedTokens: string[] = [];
			response.responses.forEach((resp, idx) => {
				if (!resp.success && resp.error?.code === "messaging/invalid-registration-token")
					failedTokens.push(tokens[idx]);
			});

			for (const token of failedTokens) await this.unsubscribeByToken(token);

			notification.status = response.successCount > 0 ? "sent" : "failed";
			notification.sentAt = Date.now();

			return notification;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Unknown error";
			await this.updateNotificationStatus(notification.id, "failed", errorMessage);
			throw error;
		}
	}

	async sendToTokens(
		tokens: string[],
		payload: NotificationPayload,
		priority: "high" | "normal" = "normal"
	): Promise<void> {
		const message = {
			notification: {
				title: payload.title,
				body: payload.body,
				imageUrl: payload.image,
			},
			data: payload.data || {},
			webpush: {
				notification: {
					icon: payload.icon,
					badge: payload.badge,
					tag: payload.tag,
					requireInteraction: payload.requireInteraction || false,
					actions: payload.actions,
				},
			},
			android: {
				priority: priority === "high" ? "high" : "normal",
			},
			tokens,
		};

		const response = await this.messaging.sendEachForMulticast(message);

		const failedTokens: string[] = [];
		response.responses.forEach((resp, idx) => {
			if (!resp.success && resp.error?.code === "messaging/invalid-registration-token")
				failedTokens.push(tokens[idx]);
		});

		for (const token of failedTokens) await this.unsubscribeByToken(token);
	}

	async updateNotificationStatus(
		notificationId: string,
		status: Notification["status"],
		error?: string,
		sentAt?: number
	): Promise<void> {
		const updateData: Record<string, unknown> = { status };

		error && (updateData.error = error);
		sentAt && (updateData.sentAt = new Date(sentAt));

		await this.firestore.collection("notifications").doc(notificationId).update(updateData);
	}

	async getNotification(notificationId: string): Promise<Notification | null> {
		const doc = await this.firestore.collection("notifications").doc(notificationId).get();

		if (!doc.exists) return null;

		const data = doc.data();
		if (!data) return null;

		return {
			id: doc.id,
			ownerId: data.ownerId,
			type: data.type,
			title: data.title,
			body: data.body,
			data: data.data,
			priority: data.priority,
			createdAt: data.createdAt.toMillis(),
			sentAt: data.sentAt?.toMillis(),
			deliveredAt: data.deliveredAt?.toMillis(),
			clickedAt: data.clickedAt?.toMillis(),
			status: data.status,
			error: data.error,
		};
	}

	async listNotifications(ownerId: string, limit: number = 50): Promise<Notification[]> {
		const snapshot = await this.firestore
			.collection("notifications")
			.where("ownerId", "==", ownerId)
			.orderBy("createdAt", "desc")
			.limit(limit)
			.get();

		return snapshot.docs.map((doc) => {
			const data = doc.data();
			return {
				id: doc.id,
				ownerId: data.ownerId,
				type: data.type,
				title: data.title,
				body: data.body,
				data: data.data,
				priority: data.priority,
				createdAt: data.createdAt.toMillis(),
				sentAt: data.sentAt?.toMillis(),
				deliveredAt: data.deliveredAt?.toMillis(),
				clickedAt: data.clickedAt?.toMillis(),
				status: data.status,
				error: data.error,
			};
		});
	}

	async markNotificationClicked(notificationId: string): Promise<void> {
		await this.firestore.collection("notifications").doc(notificationId).update({
			status: "clicked",
			clickedAt: new Date(),
		});
	}

	async testNotification(ownerId: string): Promise<Notification> {
		return this.sendNotification({
			ownerId,
			type: "new_message",
			title: "Test Notification",
			body: "This is a test notification from OneCall",
			priority: "normal",
			data: {
				test: "true",
			},
		});
	}
}
