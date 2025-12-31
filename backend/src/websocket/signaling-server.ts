// src/websocket/signaling-server.ts

import type { FastifyInstance } from "fastify";
import type { WebSocket } from "@fastify/websocket";
import type { CallStateService } from "../services/call-state.service.js";
import type { WSMessage, WebRTCOffer, WebRTCAnswer, ICECandidate } from "../types/websocket.js";

interface SocketMeta {
	id: string;
	sessionId?: string;
	userId?: string;
	ownerId?: string;
}

export class SignalingServer {
	private sockets: Map<string, { ws: WebSocket; meta: SocketMeta }> = new Map();
	private fastify: FastifyInstance;
	private callState: CallStateService;

	constructor(fastify: FastifyInstance, callState: CallStateService) {
		this.fastify = fastify;
		this.callState = callState;
	}

	handleConnection(ws: WebSocket, req: any): void {
		const socketId = this.generateSocketId();
		const socketMeta: SocketMeta = { id: socketId };

		this.sockets.set(socketId, { ws, meta: socketMeta });

		ws.on("message", async (data: Buffer) => {
			try {
				const message: WSMessage = JSON.parse(data.toString());
				await this.handleMessage(socketId, message);
			} catch (error) {
				this.sendError(socketId, "Invalid message format");
			}
		});

		ws.on("close", () => this.handleDisconnect(socketId));

		ws.on("error", (error: any) => {
			this.fastify.log.error({ socketId, error }, "WebSocket error");
			this.handleDisconnect(socketId);
		});
	}

	private async handleMessage(socketId: string, message: WSMessage): Promise<void> {
		const { type, sessionId, data } = message;
		const socket = this.sockets.get(socketId);

		if (!socket) return;

		switch (type) {
			case "join_room":
				await this.handleJoinRoom(socketId, sessionId, data as { userId?: string; ownerId?: string });
				break;

			case "offer":
				this.handleOffer(socketId, sessionId, data as WebRTCOffer);
				break;

			case "answer":
				this.handleAnswer(socketId, sessionId, data as WebRTCAnswer);
				break;

			case "ice_candidate":
				this.handleICECandidate(socketId, sessionId, data as ICECandidate);
				break;

			case "leave_room":
				await this.handleLeaveRoom(socketId, sessionId);
				break;

			default:
				this.sendError(socketId, "Unknown message type");
		}
	}

	private async handleJoinRoom(
		socketId: string,
		sessionId: string,
		data: { userId?: string; ownerId?: string }
	): Promise<void> {
		const socket = this.sockets.get(socketId);
		if (!socket) return;

		const session = this.callState.getSession(sessionId);
		if (!session) {
			this.sendError(socketId, "Session not found");
			return;
		}

		socket.meta.sessionId = sessionId;
		socket.meta.userId = data.userId;
		socket.meta.ownerId = data.ownerId;

		this.callState.addSocket(sessionId, socketId);

		this.send(socketId, { type: "join_room", sessionId, data: { success: true } });

		await this.callState.logCallEvent(sessionId, "socket_joined", {
			socketId,
			userId: data.userId,
			ownerId: data.ownerId,
		});
	}

	private handleOffer(socketId: string, sessionId: string, offer: WebRTCOffer): void {
		this.broadcastToSession(socketId, sessionId, {
			type: "offer",
			sessionId,
			data: offer,
		});
	}

	private handleAnswer(socketId: string, sessionId: string, answer: WebRTCAnswer): void {
		this.broadcastToSession(socketId, sessionId, {
			type: "answer",
			sessionId,
			data: answer,
		});
	}

	private handleICECandidate(socketId: string, sessionId: string, candidate: ICECandidate): void {
		this.broadcastToSession(socketId, sessionId, {
			type: "ice_candidate",
			sessionId,
			data: candidate,
		});
	}

	private async handleLeaveRoom(socketId: string, sessionId: string): Promise<void> {
		this.callState.removeSocket(sessionId, socketId);

		const socket = this.sockets.get(socketId);
		if (socket) {
			socket.meta.sessionId = undefined;
		}

		this.broadcastToSession(socketId, sessionId, {
			type: "leave_room",
			sessionId,
			data: { socketId },
		});

		await this.callState.logCallEvent(sessionId, "socket_left", { socketId });
	}

	private handleDisconnect(socketId: string): void {
		const socket = this.sockets.get(socketId);
		if (!socket) return;

		const { sessionId } = socket.meta;
		sessionId && this.callState.removeSocket(sessionId, socketId);

		this.sockets.delete(socketId);
	}

	private broadcastToSession(excludeSocketId: string, sessionId: string, message: WSMessage): void {
		const socketsInSession = this.callState.getSocketsInSession(sessionId);

		socketsInSession.forEach((socketId) => {
			socketId !== excludeSocketId && this.send(socketId, message);
		});
	}

	private send(socketId: string, message: WSMessage): void {
		const socket = this.sockets.get(socketId);
		socket?.ws.readyState === 1 && socket.ws.send(JSON.stringify(message));
	}

	private sendError(socketId: string, error: string): void {
		this.send(socketId, {
			type: "error",
			sessionId: "",
			data: { error },
		});
	}

	private generateSocketId(): string {
		return `socket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	async notifyEscalation(sessionId: string, ownerId: string): Promise<void> {
		const socketsInSession = this.callState.getSocketsInSession(sessionId);

		socketsInSession.forEach((socketId) => {
			const socket = this.sockets.get(socketId);
			socket?.meta.ownerId === ownerId &&
				this.send(socketId, {
					type: "call_ended",
					sessionId,
					data: { reason: "escalation", ownerId },
				});
		});
	}
}
