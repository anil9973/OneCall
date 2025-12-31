import type { FastifyRequest, FastifyReply } from "fastify";
import type { NotificationService } from "../../services/notification.service.ts";
import type { SendNotificationRequest } from "../../types/notification.ts";

export class NotificationHandlers {
	private notificationService: NotificationService;

	constructor(notificationService: NotificationService) {
		this.notificationService = notificationService;
	}

	async subscribe(
		request: FastifyRequest<{ Body: { token: string; deviceType: "web" | "android" | "ios"; userAgent?: string } }>,
		reply: FastifyReply
	) {
		const ownerId = request.owner?.id;

		if (!ownerId) return reply.code(401).send({ error: "Unauthorized" });

		const { token, deviceType, userAgent } = request.body;

		const subscription = await this.notificationService.subscribeToPush(ownerId, token, deviceType, userAgent);

		return {
			id: subscription.id,
			success: true,
		};
	}

	async unsubscribe(request: FastifyRequest<{ Params: { subscriptionId: string } }>, reply: FastifyReply) {
		const ownerId = request.owner?.id;
		const { subscriptionId } = request.params;

		if (!ownerId) return reply.code(401).send({ error: "Unauthorized" });

		await this.notificationService.unsubscribeFromPush(subscriptionId);

		return { success: true };
	}

	async listSubscriptions(request: FastifyRequest, reply: FastifyReply) {
		const ownerId = request.owner?.id;

		if (!ownerId) return reply.code(401).send({ error: "Unauthorized" });

		const subscriptions = await this.notificationService.listSubscriptions(ownerId);

		return {
			subscriptions: subscriptions.map((s) => ({
				id: s.id,
				deviceType: s.deviceType,
				userAgent: s.userAgent,
				createdAt: s.createdAt,
				lastUsed: s.lastUsed,
			})),
		};
	}

	async sendNotification(
		request: FastifyRequest<{ Body: Omit<SendNotificationRequest, "ownerId"> }>,
		reply: FastifyReply
	) {
		const ownerId = request.owner?.id;

		if (!ownerId) return reply.code(401).send({ error: "Unauthorized" });

		const notification = await this.notificationService.sendNotification({
			...request.body,
			ownerId,
		});

		return {
			id: notification.id,
			status: notification.status,
		};
	}

	async testNotification(request: FastifyRequest, reply: FastifyReply) {
		const ownerId = request.owner?.id;

		if (!ownerId) return reply.code(401).send({ error: "Unauthorized" });

		const notification = await this.notificationService.testNotification(ownerId);

		return {
			id: notification.id,
			status: notification.status,
			message: "Test notification sent successfully",
		};
	}

	async listNotifications(request: FastifyRequest<{ Querystring: { limit?: number } }>, reply: FastifyReply) {
		const ownerId = request.owner?.id;

		if (!ownerId) return reply.code(401).send({ error: "Unauthorized" });

		const { limit } = request.query;

		const notifications = await this.notificationService.listNotifications(ownerId, limit);

		return { notifications };
	}

	async markClicked(request: FastifyRequest<{ Params: { notificationId: string } }>, reply: FastifyReply) {
		const { notificationId } = request.params;

		await this.notificationService.markNotificationClicked(notificationId);

		return { success: true };
	}
}
