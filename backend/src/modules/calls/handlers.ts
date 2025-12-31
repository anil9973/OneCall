import type { FastifyRequest, FastifyReply } from "fastify";
import type { CallStateService } from "../../services/call-state.service.ts";
import type { Firestore } from "firebase-admin/firestore";
import { nanoid } from "nanoid";

interface StartCallBody {
	domain: string;
	userId: string;
	pageUrl: string;
	metadata?: Record<string, unknown>;
}

interface EscalateCallBody {
	sessionId: string;
	reason: string;
	metadata?: Record<string, unknown>;
}

interface AcceptCallBody {
	sessionId: string;
}

interface EndCallBody {
	sessionId: string;
	reason?: string;
	duration?: number;
}

export class CallHandlers {
	callState: CallStateService;
	firestore: Firestore;

	constructor(callState: CallStateService, firestore: Firestore) {
		this.callState = callState;
		this.firestore = firestore;
	}

	startCall = async (request: FastifyRequest<{ Body: StartCallBody }>, reply: FastifyReply) => {
		const { domain, userId, pageUrl, metadata } = request.body;
		const sessionId = nanoid(21);

		const session = await this.callState.createSession({
			sessionId,
			userId,
			domain,
			pageUrl,
			status: "ai",
			startedAt: Date.now(),
			metadata,
		});

		await this.callState.logCallEvent(sessionId, "started", { domain, userId, pageUrl });
		const token = await reply.jwtSign({ sessionId, userId, domain, type: "call" }, { expiresIn: "2h" });

		return {
			sessionId: session.sessionId,
			token,
			status: session.status,
		};
	};

	escalateCall = async (request: FastifyRequest<{ Body: EscalateCallBody }>, reply: FastifyReply) => {
		const { sessionId, reason, metadata } = request.body;

		const session = this.callState.getSession(sessionId);
		if (!session) {
			return reply.code(404).send({ error: "Session not found" });
		}

		const domainDoc = await this.firestore
			.collection("domains")
			.where("domain", "==", session.domain)
			.where("verified", "==", true)
			.limit(1)
			.get();

		if (domainDoc.empty) {
			return reply.code(404).send({ error: "Domain not found or not verified" });
		}

		const domain = domainDoc.docs[0].data();
		const ownerId = domain.ownerId;

		const presenceDoc = await this.firestore.collection("presence").doc(ownerId).get();

		const presence = presenceDoc.data();
		const ownerOnline = presence?.online === true && presence?.acceptingCalls === true;

		await this.callState.updateSession(sessionId, {
			status: "escalating",
			ownerId,
			escalatedAt: Date.now(),
		});

		await this.callState.logCallEvent(sessionId, "escalation", {
			reason,
			ownerId,
			ownerOnline,
			...metadata,
		});

		if (ownerOnline) {
			await this.firestore.collection("notifications").doc(ownerId).collection("pending").doc(sessionId).set({
				type: "escalation",
				sessionId,
				summary: reason,
				priority: "high",
				domain: session.domain,
				pageUrl: session.pageUrl,
				createdAt: new Date(),
			});
		}

		return {
			success: true,
			ownerId,
			ownerOnline,
		};
	};

	acceptCall = async (request: FastifyRequest<{ Body: AcceptCallBody }>, reply: FastifyReply) => {
		const { sessionId } = request.body;
		const ownerId = request.owner?.id;

		if (!ownerId) {
			return reply.code(401).send({ error: "Unauthorized" });
		}

		const session = this.callState.getSession(sessionId);
		if (!session) {
			return reply.code(404).send({ error: "Session not found" });
		}

		if (session.ownerId !== ownerId) {
			return reply.code(403).send({ error: "Not your session" });
		}

		await this.callState.updateSession(sessionId, {
			status: "human",
		});

		await this.callState.logCallEvent(sessionId, "accepted", {
			ownerId,
		});

		await this.firestore.collection("notifications").doc(ownerId).collection("pending").doc(sessionId).delete();

		return {
			success: true,
			session: {
				sessionId: session.sessionId,
				domain: session.domain,
				pageUrl: session.pageUrl,
				userId: session.userId,
				status: session.status,
			},
		};
	};

	endCall = async (request: FastifyRequest<{ Body: EndCallBody }>, reply: FastifyReply) => {
		const { sessionId, reason, duration } = request.body;

		const session = this.callState.getSession(sessionId);
		if (!session) return reply.code(404).send({ error: "Session not found" });

		await this.callState.logCallEvent(sessionId, "ended", {
			reason,
			duration,
			finalStatus: session.status,
		});

		await this.callState.endSession(sessionId);

		return { success: true };
	};

	getActiveCalls = async (
		request: FastifyRequest<{ Querystring: { domain?: string; limit?: number } }>,
		reply: FastifyReply
	) => {
		const ownerId = request.owner?.id;
		if (!ownerId) return reply.code(401).send({ error: "Unauthorized" });

		const { domain, limit = 20 } = request.query;

		let query = this.firestore.collection("active_sessions").where("ownerId", "==", ownerId);

		domain && (query = query.where("domain", "==", domain));

		const snapshot = await query.orderBy("startedAt", "desc").limit(limit).get();

		const calls = snapshot.docs.map((doc) => ({
			sessionId: doc.id,
			...doc.data(),
			startedAt: doc.data().startedAt.toDate().toISOString(),
		}));

		return {
			calls,
			total: calls.length,
		};
	};
}
