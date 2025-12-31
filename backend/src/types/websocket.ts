export type CallStatus = "ai" | "escalating" | "human" | "ended";

export type WSEventType = "join_room" | "offer" | "answer" | "ice_candidate" | "leave_room" | "call_ended" | "error";

export interface CallSession {
	sessionId: string;
	userId: string;
	ownerId?: string;
	status: CallStatus;
	domain: string;
	pageUrl: string;
	startedAt: number;
	aiEndedAt?: number;
	escalatedAt?: number;
	connectedSockets: Set<string>;
	metadata?: Record<string, unknown>;
}

export interface WSMessage {
	type: WSEventType;
	sessionId: string;
	data?: unknown;
}

export interface WebRTCOffer {
	type: "offer";
	sdp: string;
}

export interface WebRTCAnswer {
	type: "answer";
	sdp: string;
}

export interface ICECandidate {
	candidate: string;
	sdpMLineIndex?: number;
	sdpMid?: string;
}
