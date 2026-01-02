// src/lib/api/adapters/conversation-adapter.ts

import type { BackendConversation, ConversationSummary, BackendMessage } from '../types/backend-types';
import type { Conversation, Message, SystemEvent, TimelineSegment } from '../../../types/conversations';

function formatDuration(seconds: number): string {
	const minutes = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return minutes > 0 ? `${minutes}m ${secs}s` : `${secs}s`;
}

function formatTimestamp(timestamp: number): string {
	const date = new Date(timestamp);
	const now = new Date();
	const diff = now.getTime() - date.getTime();
	const minutes = Math.floor(diff / 60000);
	const hours = Math.floor(diff / 3600000);
	const days = Math.floor(diff / 86400000);
	
	if (minutes < 1) return 'Just now';
	if (minutes < 60) return `${minutes}m ago`;
	if (hours < 24) return `${hours}h ago`;
	if (days < 7) return `${days}d ago`;
	
	return date.toLocaleDateString();
}

function getStatusText(status: string): string {
	const statusMap: Record<string, string> = {
		active: 'AI Handling',
		escalated: 'Human Agent',
		resolved: 'Resolved',
		archived: 'Archived'
	};
	return statusMap[status] || status;
}

function getPriority(metrics: { escalated: boolean; duration: number }): 'low' | 'medium' | 'high' {
	if (metrics.escalated) return 'high';
	if (metrics.duration > 300) return 'medium';
	return 'low';
}

export function toConversation(backend: ConversationSummary): Conversation {
	return {
		id: backend.id,
		status: backend.status,
		priority: getPriority({ escalated: backend.escalated, duration: backend.duration }),
		title: `Session ${backend.sessionId.slice(-8)}`,
		category: backend.domain,
		categoryIcon: '🏪',
		duration: formatDuration(backend.duration),
		lastMessagePreview: backend.lastMessage || 'No messages yet',
		lastMessageRole: 'user',
		statusText: getStatusText(backend.status),
		timestamp: formatTimestamp(backend.startedAt),
		timestampAbsolute: new Date(backend.startedAt)
	};
}

export function toConversationList(summaries: ConversationSummary[]): Conversation[] {
	return summaries.map(toConversation);
}

export function toMessage(backend: BackendMessage): Message {
	return {
		id: backend.id,
		role: backend.role,
		content: backend.content,
		timestamp: backend.timestamp,
		audioUrl: backend.audioUrl,
		duration: backend.duration,
		audioWaveform: undefined
	};
}

export function toMessageList(messages: BackendMessage[]): Message[] {
	return messages.map(toMessage);
}

export function extractSystemEvents(conversation: BackendConversation): SystemEvent[] {
	const events: SystemEvent[] = [];
	
	if (conversation.metrics.escalated && conversation.metrics.escalationReason) {
		events.push({
			id: `escalation-${conversation.id}`,
			type: 'escalation',
			timestamp: formatTimestamp(conversation.startedAt + (conversation.metrics.duration * 1000 * 0.7)),
			text: 'Call escalated to human agent',
			details: conversation.metrics.escalationReason,
			icon: '👤'
		});
	}
	
	if (conversation.status === 'resolved') {
		events.push({
			id: `resolution-${conversation.id}`,
			type: 'resolution',
			timestamp: formatTimestamp(conversation.endedAt || Date.now()),
			text: 'Issue resolved successfully',
			icon: '✅'
		});
	}
	
	return events;
}

export function extractTimelineSegments(conversation: BackendConversation): TimelineSegment[] {
	const segments: TimelineSegment[] = [
		{
			type: 'start',
			time: formatTimestamp(conversation.startedAt),
			label: 'Call Started',
			icon: '📞'
		}
	];
	
	if (conversation.metrics.aiHandled) {
		segments.push({
			type: 'ai-handling',
			time: formatTimestamp(conversation.startedAt + 60000),
			label: 'AI Assistant',
			icon: '🤖'
		});
	}
	
	if (conversation.metrics.escalated) {
		const escalationTime = conversation.startedAt + (conversation.metrics.duration * 1000 * 0.7);
		segments.push({
			type: 'escalation',
			time: formatTimestamp(escalationTime),
			label: 'Escalated',
			icon: '👤'
		});
	}
	
	if (conversation.status === 'resolved') {
		segments.push({
			type: 'resolved',
			time: formatTimestamp(conversation.endedAt || Date.now()),
			label: 'Resolved',
			icon: '✅'
		});
	} else if (conversation.status === 'active') {
		segments.push({
			type: 'current',
			time: 'Now',
			label: 'In Progress'
		});
	}
	
	return segments;
}
