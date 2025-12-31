import type {
	Ticket,
	Message,
	SystemEvent,
	TimelineSegment,
	AiSuggestion,
	QuickAction,
	Insight,
} from "../types/conversations";

export const MOCK_TICKETS: Ticket[] = [
	{
		id: "ticket-1",
		status: "escalated",
		priority: "high",
		title: "Need refund approval",
		category: "Refund",
		categoryIcon: "💰",
		duration: "2:13",
		lastMessagePreview: "I want my money back for order #12345...",
		lastMessageRole: "user",
		statusText: "Escalated",
		timestamp: "1min ago",
		timestampAbsolute: new Date(Date.now() - 60000),
	},
	{
		id: "ticket-2",
		status: "pending",
		priority: "medium",
		title: "Order tracking inquiry",
		category: "Tracking",
		categoryIcon: "📦",
		duration: "1:45",
		lastMessagePreview: "Where is my package? It was supposed to arrive...",
		lastMessageRole: "assistant",
		statusText: "Pending",
		timestamp: "5min ago",
		timestampAbsolute: new Date(Date.now() - 300000),
	},
	{
		id: "ticket-3",
		status: "resolved",
		priority: "low",
		title: "Product size question",
		category: "Product Info",
		categoryIcon: "👕",
		duration: "0:58",
		lastMessagePreview: "Thanks! That answered my question perfectly.",
		lastMessageRole: "user",
		statusText: "Resolved",
		timestamp: "15min ago",
		timestampAbsolute: new Date(Date.now() - 900000),
	},
	{
		id: "ticket-4",
		status: "new",
		priority: "medium",
		title: "Payment failed error",
		category: "Payment",
		categoryIcon: "💳",
		duration: "0:32",
		lastMessagePreview: "My card was declined but I have enough balance...",
		lastMessageRole: "user",
		statusText: "New",
		timestamp: "30min ago",
		timestampAbsolute: new Date(Date.now() - 1800000),
	},
	{
		id: "ticket-5",
		status: "pending",
		priority: "high",
		title: "Account access issue",
		category: "Account",
		categoryIcon: "👤",
		duration: "3:22",
		lastMessagePreview: "I can't log in even after resetting password...",
		lastMessageRole: "assistant",
		statusText: "Pending",
		timestamp: "1h ago",
		timestampAbsolute: new Date(Date.now() - 3600000),
	},
	{
		id: "ticket-6",
		status: "escalated",
		priority: "high",
		title: "Damaged item received",
		category: "Returns",
		categoryIcon: "📮",
		duration: "4:15",
		lastMessagePreview: "The product arrived broken in multiple pieces...",
		lastMessageRole: "user",
		statusText: "Escalated",
		timestamp: "2h ago",
		timestampAbsolute: new Date(Date.now() - 7200000),
	},
];

export const MOCK_MESSAGES: Message[] = [
	{
		id: "msg-1",
		role: "user",
		content: "I'm trying to use coupon code SAVE50 but it's not working on my cart. Can you help?",
		timestamp: "00:01",
		audioUrl: "/audio/msg-1.mp3",
		audioDuration: "0:04",
		audioWaveform: [0.2, 0.5, 0.8, 0.6, 0.3, 0.7, 0.9, 0.4, 0.2, 0.5],
	},
	{
		id: "msg-2",
		role: "assistant",
		content: "I'd be happy to help you with that coupon code. Let me check the details of SAVE50 for you.",
		timestamp: "00:14",
		audioUrl: "/audio/msg-2.mp3",
		audioDuration: "0:06",
		audioWaveform: [0.3, 0.4, 0.6, 0.5, 0.7, 0.6, 0.4, 0.3, 0.5, 0.4],
	},
	{
		id: "msg-3",
		role: "assistant",
		content:
			"I see the issue. This coupon is only valid for orders over $100, and your cart total is $89. Would you like to add more items or use a different coupon?",
		timestamp: "00:28",
		audioUrl: "/audio/msg-3.mp3",
		audioDuration: "0:09",
		audioWaveform: [0.4, 0.6, 0.7, 0.8, 0.6, 0.5, 0.7, 0.6, 0.4, 0.3],
	},
	{
		id: "msg-4",
		role: "user",
		content:
			"Oh I see. That's frustrating. Can I get a refund on my previous order #12345 instead? I'm not satisfied with the product.",
		timestamp: "00:45",
		audioUrl: "/audio/msg-4.mp3",
		audioDuration: "0:08",
		audioWaveform: [0.5, 0.7, 0.8, 0.9, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2],
	},
	{
		id: "msg-5",
		role: "assistant",
		content:
			"I understand your concern. However, refund requests require approval from our team. Let me connect you with a human agent who can help with your refund request.",
		timestamp: "01:58",
		audioUrl: "/audio/msg-5.mp3",
		audioDuration: "0:10",
		audioWaveform: [0.4, 0.5, 0.6, 0.7, 0.6, 0.5, 0.4, 0.5, 0.6, 0.4],
	},
	{
		id: "msg-6",
		role: "system",
		content: "Call escalated to human agent. Connecting...",
		timestamp: "02:03",
	},
];

export const MOCK_SYSTEM_EVENTS: SystemEvent[] = [
	{
		id: "event-1",
		type: "issue-detected",
		timestamp: "00:45",
		text: "Policy Violation Detected",
		details: "Refund request outside standard policy window",
		icon: "⚠️",
	},
	{
		id: "event-2",
		type: "escalation",
		timestamp: "01:58",
		text: "Escalated to Human Agent",
		details: "Requires manager approval for refund",
		icon: "🔴",
	},
];

export const MOCK_TIMELINE_SEGMENTS: TimelineSegment[] = [
	{
		type: "start",
		time: "00:00",
		label: "Call Started",
		icon: "🟢",
	},
	{
		type: "ai-handling",
		time: "00:09",
		label: "AI Assisting",
	},
	{
		type: "issue",
		time: "00:45",
		label: "Issue Detected",
		icon: "⚠️",
	},
	{
		type: "escalation",
		time: "01:58",
		label: "Escalated",
		icon: "🔴",
	},
	{
		type: "current",
		time: "02:13",
		label: "Now",
	},
];

export const MOCK_AI_SUGGESTION: AiSuggestion = {
	id: "suggestion-1",
	question: "Was the refund already processed?",
	options: [
		{
			value: "yes",
			label: "Yes, refund processed",
			description: "Customer confirmed receiving refund",
		},
		{
			value: "no",
			label: "No, still waiting",
			description: "Refund not yet initiated",
		},
		{
			value: "partial",
			label: "Partial refund",
			description: "Only part of amount refunded",
		},
	],
};

export const MOCK_QUICK_ACTIONS: QuickAction[] = [
	{
		id: "action-1",
		type: "primary",
		label: "Issue Refund",
		icon: "💰",
		description: "Process full refund for order",
		data: { orderId: "#12345", amount: 1299 },
	},
	{
		id: "action-2",
		type: "secondary",
		label: "Send Return Label",
		icon: "📮",
		description: "Email return shipping label",
	},
	{
		id: "action-3",
		type: "secondary",
		label: "Track Package",
		icon: "📦",
		description: "Check current delivery status",
	},
	{
		id: "action-4",
		type: "secondary",
		label: "Offer Coupon",
		icon: "🎫",
		description: "Send 20% discount code",
	},
];

export const MOCK_INSIGHTS: Record<string, Insight> = {
	intent: {
		type: "intent",
		data: {
			primary: "Refund request",
			confidence: 94,
			secondary: ["Coupon issue", "Product dissatisfaction"],
		},
	},
	status: {
		type: "status",
		data: {
			current: "Escalated",
			reason: "Needs human review",
			priority: "high",
		},
	},
	sentiment: {
		type: "sentiment",
		data: {
			journey: ["😊", "😐", "😕", "😠"],
			current: "Frustrated",
			score: 15,
		},
	},
	attachments: {
		type: "attachments",
		data: [
			{ type: "screenshot", url: "/screenshots/cart.png", timestamp: "00:15" },
			{ type: "screenshot", url: "/screenshots/error.png", timestamp: "00:45" },
		],
	},
	tags: {
		type: "tags",
		data: ["#refund", "#policy", "#escalation", "#order-12345"],
	},
};
