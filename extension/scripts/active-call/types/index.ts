export type CallStatus = "idle" | "connecting" | "connected" | "ended";
export type AIState = "listening" | "thinking" | "acting" | "speaking";

export interface Message {
	id: string;
	role: "user" | "ai";
	content: string;
	timestamp: number;
}

export interface IVROption {
	id: string;
	number: number;
	text: string;
}

export interface UserInputRequest {
	id: string;
	type: "text" | "number" | "otp";
	label: string;
	placeholder: string;
	value: string;
	maxLength?: number;
}

export interface WidgetState {
	callStatus: CallStatus;
	aiState: AIState;
	currentPage: string;
	transcriptMessages: Message[];
	ivrOptions: IVROption[];
	userInputRequest: UserInputRequest | undefined;
	isMuted: boolean;
	volume: number;
	isTranscriptExpanded: boolean;
	unofficialMode: boolean;
	isUnofficialExpanded: boolean;
}
