import type { Firestore } from "firebase-admin/firestore";

export class ArchivalService {
	firestore: Firestore;
	constructor(firestore: Firestore) {
		this.firestore = firestore;
	}

	async scheduleArchival(conversationId: string): Promise<void> {
		await this.firestore.collection("archival_queue").doc(conversationId).set({
			conversationId,
			status: "pending",
			scheduledAt: new Date(),
			attempts: 0,
		});
	}

	async processArchivalQueue(limit: number = 10): Promise<number> {
		const snapshot = await this.firestore
			.collection("archival_queue")
			.where("status", "==", "pending")
			.where("attempts", "<", 3)
			.limit(limit)
			.get();

		let processed = 0;

		for (const doc of snapshot.docs) {
			const queueItem = doc.data();

			try {
				await this.archiveConversation(queueItem.conversationId);

				await doc.ref.update({
					status: "completed",
					completedAt: new Date(),
				});

				processed++;
			} catch (error) {
				await doc.ref.update({
					status: "failed",
					attempts: queueItem.attempts + 1,
					lastError: error instanceof Error ? error.message : "Unknown error",
					lastAttemptAt: new Date(),
				});
			}
		}

		return processed;
	}

	private async archiveConversation(conversationId: string): Promise<void> {
		const conversationDoc = await this.firestore.collection("conversations").doc(conversationId).get();

		if (!conversationDoc.exists) {
			throw new Error("Conversation not found");
		}

		const conversation = conversationDoc.data() as Conversation;

		await this.firestore
			.collection("archived_conversations")
			.doc(conversationId)
			.set({
				...conversation,
				archivedAt: new Date(),
			});

		const messagesSnapshot = await this.firestore
			.collection("conversations")
			.doc(conversationId)
			.collection("messages")
			.get();

		if (!messagesSnapshot.empty) {
			const batch = this.firestore.batch();

			messagesSnapshot.docs.forEach((messageDoc) => {
				const messageRef = this.firestore
					.collection("archived_conversations")
					.doc(conversationId)
					.collection("messages")
					.doc(messageDoc.id);

				batch.set(messageRef, messageDoc.data());
			});

			await batch.commit();
		}

		await conversationDoc.ref.delete();
	}

	async getArchivedConversation(conversationId: string): Promise<Conversation | null> {
		const doc = await this.firestore.collection("archived_conversations").doc(conversationId).get();

		if (!doc.exists) return null;

		const data = doc.data();
		if (!data) return null;

		const messagesSnapshot = await this.firestore
			.collection("archived_conversations")
			.doc(conversationId)
			.collection("messages")
			.orderBy("timestamp", "asc")
			.get();

		const messages = messagesSnapshot.docs.map((d) => ({
			...d.data(),
			timestamp: d.data().timestamp.toMillis(),
		}));

		return {
			id: doc.id,
			sessionId: data.sessionId,
			domain: data.domain,
			userId: data.userId,
			ownerId: data.ownerId || undefined,
			status: data.status,
			startedAt: data.startedAt.toMillis(),
			endedAt: data.endedAt?.toMillis(),
			messages: messages as any,
			toolCalls: data.toolCalls || [],
			metrics: data.metrics,
			metadata: data.metadata || {},
		};
	}

	async cleanupOldArchives(daysOld: number = 90): Promise<number> {
		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - daysOld);

		const snapshot = await this.firestore
			.collection("archived_conversations")
			.where("archivedAt", "<=", cutoffDate)
			.limit(50)
			.get();

		const batch = this.firestore.batch();

		snapshot.docs.forEach((doc) => {
			batch.delete(doc.ref);
		});

		await batch.commit();

		return snapshot.docs.length;
	}
}
