import type { Firestore } from "firebase-admin/firestore";
import type {
	Conversation,
	Message,
	ConversationSummary,
	ConversationFilter,
	ConversationSearchQuery,
} from "../types/conversation.js";
import { nanoid } from "nanoid";

export class ConversationService {
	private firestore: Firestore;

	constructor(firestore: Firestore) {
		this.firestore = firestore;
	}

	async startConversation(data: {
		sessionId: string;
		domain: string;
		userId: string;
		ownerId?: string;
		metadata?: Record<string, unknown>;
	}): Promise<Conversation> {
		const conversation: Conversation = {
			id: nanoid(21),
			sessionId: data.sessionId,
			domain: data.domain,
			userId: data.userId,
			ownerId: data.ownerId,
			status: "active",
			startedAt: Date.now(),
			messages: [],
			toolCalls: [],
			metrics: {
				duration: 0,
				turnCount: 0,
				escalated: false,
				aiHandled: true,
			},
			metadata: data.metadata || {},
		};

		await this.firestore
			.collection("conversations")
			.doc(conversation.id)
			.set({
				...conversation,
				startedAt: new Date(conversation.startedAt),
				messages: [],
				toolCalls: [],
			});

		return conversation;
	}

	async addMessage(conversationId: string, message: Omit<Message, "id">): Promise<Message> {
		const fullMessage: Message = {
			id: nanoid(16),
			...message,
		};

		const conversationRef = this.firestore.collection("conversations").doc(conversationId);

		await this.firestore.runTransaction(async (transaction) => {
			const doc = await transaction.get(conversationRef);

			if (!doc.exists) {
				throw new Error("Conversation not found");
			}

			const data = doc.data();
			const messages = data?.messages || [];
			const turnCount = data?.metrics?.turnCount || 0;

			transaction.update(conversationRef, {
				messages: [
					...messages,
					{
						...fullMessage,
						timestamp: new Date(fullMessage.timestamp),
					},
				],
				"metrics.turnCount": turnCount + 1,
			});
		});

		return fullMessage;
	}

	async addToolCall(conversationId: string, toolCallId: string): Promise<void> {
		const conversationRef = this.firestore.collection("conversations").doc(conversationId);

		await conversationRef.update({
			toolCalls: this.firestore.FieldValue.arrayUnion(toolCallId),
		});
	}

	async endConversation(
		conversationId: string,
		data: {
			resolution?: string;
			rating?: number;
			duration?: number;
		}
	): Promise<void> {
		const conversationRef = this.firestore.collection("conversations").doc(conversationId);

		await conversationRef.update({
			status: "ended",
			endedAt: new Date(),
			"metrics.duration": data.duration || 0,
			resolution: data.resolution || "unresolved",
			rating: data.rating || null,
		});
	}

	async getConversation(conversationId: string): Promise<Conversation | null> {
		const doc = await this.firestore.collection("conversations").doc(conversationId).get();

		if (!doc.exists) return null;

		const data = doc.data();
		if (!data) return null;

		return {
			id: doc.id,
			sessionId: data.sessionId,
			domain: data.domain,
			userId: data.userId,
			ownerId: data.ownerId || undefined,
			status: data.status,
			startedAt: data.startedAt.toMillis(),
			endedAt: data.endedAt?.toMillis(),
			messages: data.messages.map((m: any) => ({
				...m,
				timestamp: m.timestamp.toMillis(),
			})),
			toolCalls: data.toolCalls || [],
			metrics: data.metrics,
			metadata: data.metadata || {},
		};
	}

	async getConversationBySessionId(sessionId: string): Promise<Conversation | null> {
		const snapshot = await this.firestore
			.collection("conversations")
			.where("sessionId", "==", sessionId)
			.limit(1)
			.get();

		if (snapshot.empty) return null;

		const doc = snapshot.docs[0];
		const data = doc.data();

		return {
			id: doc.id,
			sessionId: data.sessionId,
			domain: data.domain,
			userId: data.userId,
			ownerId: data.ownerId || undefined,
			status: data.status,
			startedAt: data.startedAt.toMillis(),
			endedAt: data.endedAt?.toMillis(),
			messages: data.messages.map((m: any) => ({
				...m,
				timestamp: m.timestamp.toMillis(),
			})),
			toolCalls: data.toolCalls || [],
			metrics: data.metrics,
			metadata: data.metadata || {},
		};
	}

	async listConversations(filter: ConversationFilter): Promise<ConversationSummary[]> {
		let query = this.firestore.collection("conversations") as any;

		filter.domain && (query = query.where("domain", "==", filter.domain));
		filter.status && (query = query.where("status", "==", filter.status));

		if (filter.startDate) {
			query = query.where("startedAt", ">=", new Date(filter.startDate));
		}

		if (filter.endDate) {
			query = query.where("startedAt", "<=", new Date(filter.endDate));
		}

		if (filter.escalated !== undefined) {
			query = query.where("metrics.escalated", "==", filter.escalated);
		}

		query = query.orderBy("startedAt", "desc");

		const limit = filter.limit || 20;
		const offset = filter.offset || 0;

		query = query.limit(limit).offset(offset);

		const snapshot = await query.get();

		return snapshot.docs.map((doc: any) => {
			const data = doc.data();
			return {
				id: doc.id,
				sessionId: data.sessionId,
				domain: data.domain,
				status: data.status,
				startedAt: data.startedAt.toMillis(),
				endedAt: data.endedAt?.toMillis(),
				messageCount: data.messages?.length || 0,
				duration: data.metrics?.duration || 0,
				escalated: data.metrics?.escalated || false,
				resolution: data.resolution,
				rating: data.rating,
			};
		});
	}

	async searchConversations(searchQuery: ConversationSearchQuery): Promise<ConversationSummary[]> {
		let query = this.firestore.collection("conversations") as any;

		searchQuery.domain && (query = query.where("domain", "==", searchQuery.domain));

		const snapshot = await query
			.orderBy("startedAt", "desc")
			.limit(searchQuery.limit || 50)
			.get();

		const queryLower = searchQuery.query.toLowerCase();

		const filtered = snapshot.docs.filter((doc: any) => {
			const data = doc.data();
			const messages = data.messages || [];

			return messages.some((msg: any) => msg.content?.toLowerCase().includes(queryLower));
		});

		return filtered.map((doc: any) => {
			const data = doc.data();
			return {
				id: doc.id,
				sessionId: data.sessionId,
				domain: data.domain,
				status: data.status,
				startedAt: data.startedAt.toMillis(),
				endedAt: data.endedAt?.toMillis(),
				messageCount: data.messages?.length || 0,
				duration: data.metrics?.duration || 0,
				escalated: data.metrics?.escalated || false,
				resolution: data.resolution,
				rating: data.rating,
			};
		});
	}

	async updateEscalationStatus(conversationId: string, escalated: boolean, reason?: string): Promise<void> {
		await this.firestore
			.collection("conversations")
			.doc(conversationId)
			.update({
				"metrics.escalated": escalated,
				"metrics.escalationReason": reason || null,
				"metrics.aiHandled": !escalated,
			});
	}

	async archiveOldConversations(daysOld: number = 7): Promise<number> {
		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - daysOld);

		const snapshot = await this.firestore
			.collection("conversations")
			.where("status", "==", "ended")
			.where("endedAt", "<=", cutoffDate)
			.limit(100)
			.get();

		const batch = this.firestore.batch();

		snapshot.docs.forEach((doc) => {
			batch.update(doc.ref, { status: "archived" });
		});

		await batch.commit();

		return snapshot.docs.length;
	}
}
