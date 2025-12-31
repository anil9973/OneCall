import type { FastifyInstance } from "fastify";
import { NotificationHandlers } from "./handlers.ts";
import * as schema from "./schema.ts";

export async function notificationRoutes(fastify: FastifyInstance) {
	const handlers = new NotificationHandlers(fastify.notificationService);

	fastify.post(
		"/subscribe",
		{
			schema: schema.subscribeSchema,
			onRequest: [fastify.authenticateOwner],
		},
		handlers.subscribe.bind(handlers)
	);

	fastify.delete(
		"/subscribe/:subscriptionId",
		{
			schema: schema.unsubscribeSchema,
			onRequest: [fastify.authenticateOwner],
		},
		handlers.unsubscribe.bind(handlers)
	);

	fastify.get(
		"/subscriptions",
		{
			schema: schema.listSubscriptionsSchema,
			onRequest: [fastify.authenticateOwner],
		},
		handlers.listSubscriptions.bind(handlers)
	);

	fastify.post(
		"/send",
		{
			schema: schema.sendNotificationSchema,
			onRequest: [fastify.authenticateOwner],
		},
		handlers.sendNotification.bind(handlers)
	);

	fastify.post(
		"/test",
		{
			schema: schema.testNotificationSchema,
			onRequest: [fastify.authenticateOwner],
		},
		handlers.testNotification.bind(handlers)
	);

	fastify.get(
		"/history",
		{
			schema: schema.listNotificationsSchema,
			onRequest: [fastify.authenticateOwner],
		},
		handlers.listNotifications.bind(handlers)
	);

	fastify.post(
		"/:notificationId/clicked",
		{
			schema: schema.markClickedSchema,
		},
		handlers.markClicked.bind(handlers)
	);
}
