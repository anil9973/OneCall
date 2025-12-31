// src/lib/utils.ts

import type { MessageRole, TicketStatus, TicketPriority } from "../types/conversations";

export function getRoleIcon(role: MessageRole): string {
	const icons = {
		user: "👤",
		assistant: "🤖",
		system: "⚙️",
	};
	return icons[role];
}

export function getStatusIcon(status: TicketStatus): string {
	const icons = {
		new: "🆕",
		pending: "🟡",
		escalated: "🔴",
		resolved: "✅",
	};
	return icons[status];
}

export function getPriorityIcon(priority: TicketPriority): string {
	const icons = {
		high: "⚡",
		medium: "⚠️",
		low: "ℹ️",
	};
	return icons[priority];
}

export function formatTimestamp(date: Date): string {
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMins = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMs / 3600000);
	const diffDays = Math.floor(diffMs / 86400000);

	if (diffMins < 1) return "just now";
	if (diffMins < 60) return `${diffMins}min ago`;
	if (diffHours < 24) return `${diffHours}h ago`;
	if (diffDays < 7) return `${diffDays}d ago`;
	return date.toLocaleDateString();
}

export function formatDuration(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function truncateText(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text;
	return text.substring(0, maxLength - 3) + "...";
}

export function getSegmentHeight(index: number, segments: any[]): number {
	if (segments.length <= 1) return 100;
	return (index / (segments.length - 1)) * 100;
}
