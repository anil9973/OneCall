import type { NotificationService } from "./notification.service.ts";
import type { CallSession } from "../types/websocket.ts";

export class NotificationTriggerService {
	private notificationService: NotificationService;

	constructor(notificationService: NotificationService) {
		this.notificationService = notificationService;
	}

	async onCallStarted(session: CallSession): Promise<void> {
		if (!session.ownerId) return;

		await this.notificationService.sendNotification({
			ownerId: session.ownerId,
			type: "call_started",
			title: "New Call Started",
			body: `A customer started a call on ${session.domain}`,
			priority: "normal",
			data: {
				sessionId: session.sessionId,
				domain: session.domain,
				pageUrl: session.pageUrl || "",
				status: session.status,
			},
			tag: `call-${session.sessionId}`,
			requireInteraction: false,
		});
	}

	async onEscalationRequested(session: CallSession, reason?: string): Promise<void> {
		if (!session.ownerId) return;

		await this.notificationService.sendNotification({
			ownerId: session.ownerId,
			type: "escalation_requested",
			title: "Call Escalation Requested",
			body: reason || `Customer requested to speak with a human on ${session.domain}`,
			priority: "high",
			data: {
				sessionId: session.sessionId,
				domain: session.domain,
				pageUrl: session.pageUrl || "",
				reason: reason || "Customer requested escalation",
			},
			tag: `escalation-${session.sessionId}`,
			requireInteraction: true,
		});
	}

	async onNewMessage(session: CallSession, messageContent: string): Promise<void> {
		if (!session.ownerId || session.status !== "human") return;

		const truncatedMessage = messageContent.length > 100 ? `${messageContent.substring(0, 100)}...` : messageContent;

		await this.notificationService.sendNotification({
			ownerId: session.ownerId,
			type: "new_message",
			title: `New message from ${session.domain}`,
			body: truncatedMessage,
			priority: "high",
			data: {
				sessionId: session.sessionId,
				domain: session.domain,
				message: messageContent,
			},
			tag: `message-${session.sessionId}`,
			requireInteraction: false,
		});
	}

	async onCallEnded(session: CallSession, duration: number): Promise<void> {
		if (!session.ownerId) return;

		const minutes = Math.floor(duration / 60);
		const seconds = duration % 60;
		const durationStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

		await this.notificationService.sendNotification({
			ownerId: session.ownerId,
			type: "call_ended",
			title: "Call Ended",
			body: `Call on ${session.domain} ended after ${durationStr}`,
			priority: "low",
			data: {
				sessionId: session.sessionId,
				domain: session.domain,
				duration: String(duration),
				status: session.status,
			},
			tag: `call-${session.sessionId}`,
		});
	}
}
