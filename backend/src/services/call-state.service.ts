import type { Firestore } from "firebase-admin/firestore";
import type { CallSession, CallStatus } from "../types/websocket.ts";

export class CallStateService {
	private sessions: Map<string, CallSession> = new Map();
	private firestore: Firestore;

	constructor(firestore: Firestore) {
		this.firestore = firestore;
	}

	async createSession(data: Omit<CallSession, "connectedSockets">): Promise<CallSession> {
		const session: CallSession = {
			...data,
			connectedSockets: new Set(),
		};

		this.sessions.set(session.sessionId, session);

		await this.firestore
			.collection("active_sessions")
			.doc(session.sessionId)
			.set({
				userId: session.userId,
				ownerId: session.ownerId || null,
				status: session.status,
				domain: session.domain,
				pageUrl: session.pageUrl,
				startedAt: new Date(session.startedAt),
				metadata: session.metadata || {},
			});

		return session;
	}

	getSession(sessionId: string): CallSession | undefined {
		return this.sessions.get(sessionId);
	}

	async updateSession(sessionId: string, updates: Partial<CallSession>): Promise<void> {
		const session = this.sessions.get(sessionId);
		if (!session) return;

		Object.assign(session, updates);

		const firestoreUpdates: Record<string, unknown> = {};
		updates.status && (firestoreUpdates.status = updates.status);
		updates.ownerId && (firestoreUpdates.ownerId = updates.ownerId);
		updates.escalatedAt && (firestoreUpdates.escalatedAt = new Date(updates.escalatedAt));
		updates.aiEndedAt && (firestoreUpdates.aiEndedAt = new Date(updates.aiEndedAt));

		await this.firestore.collection("active_sessions").doc(sessionId).update(firestoreUpdates);
	}

	addSocket(sessionId: string, socketId: string): void {
		const session = this.sessions.get(sessionId);
		session?.connectedSockets.add(socketId);
	}

	removeSocket(sessionId: string, socketId: string): void {
		const session = this.sessions.get(sessionId);
		session?.connectedSockets.delete(socketId);
	}

	getSocketsInSession(sessionId: string): Set<string> {
		return this.sessions.get(sessionId)?.connectedSockets || new Set();
	}

	async endSession(sessionId: string): Promise<void> {
		const session = this.sessions.get(sessionId);
		if (!session) return;

		await this.updateSession(sessionId, {
			status: "ended",
			aiEndedAt: Date.now(),
		});

		this.sessions.delete(sessionId);

		await this.firestore.collection("active_sessions").doc(sessionId).delete();
	}

	async logCallEvent(sessionId: string, type: string, data?: Record<string, unknown>): Promise<void> {
		await this.firestore
			.collection("call_events")
			.doc(sessionId)
			.collection("events")
			.add({
				type,
				timestamp: new Date(),
				data: data || {},
			});
	}
}
