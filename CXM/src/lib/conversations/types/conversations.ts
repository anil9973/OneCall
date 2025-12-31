export type TicketStatus = "new" | "pending" | "escalated" | "resolved";
export type TicketPriority = "low" | "medium" | "high";
export type MessageRole = "user" | "assistant" | "system";
export type TimelineSegmentType = "start" | "ai-handling" | "issue" | "escalation" | "resolved" | "current";

export interface Ticket {
	id: string;
	status: TicketStatus;
	priority: TicketPriority;
	title: string;
	category: string;
	categoryIcon: string;
	duration: string;
	lastMessagePreview: string;
	lastMessageRole: MessageRole;
	statusText: string;
	timestamp: string;
	timestampAbsolute: Date;
}

export interface Message {
	id: string;
	role: MessageRole;
	content: string;
	timestamp: string;
	audioUrl?: string;
	audioDuration?: string;
	audioWaveform?: number[];
}

export interface SystemEvent {
	id: string;
	type: "issue-detected" | "escalation" | "resolution";
	timestamp: string;
	text: string;
	details?: string;
	icon: string;
}

export interface TimelineSegment {
	type: TimelineSegmentType;
	time: string;
	label?: string;
	icon?: string;
}

export interface AiSuggestion {
	id: string;
	question: string;
	options: Array<{
		value: string;
		label: string;
		description: string;
	}>;
}

export interface QuickAction {
	id: string;
	type: "primary" | "secondary";
	label: string;
	icon: string;
	description?: string;
	data?: any;
}

export interface Insight {
	type: "intent" | "status" | "timeline" | "sentiment" | "attachments" | "tags" | "actions";
	data: any;
}
