<script lang="ts">
	import MessageBubble from "./MessageBubble.svelte";
	import TimelineBar from "./TimelineBar.svelte";
	import MessageInput from "./MessageInput.svelte";
	import type { Ticket, Message, SystemEvent, TimelineSegment } from "../types/conversations";
	import ConversationHeader from "./ConversationHeader.svelte";
	import MessagesArea from "./MessagesArea.svelte";

	interface Props {
		ticket?: Ticket;
		messages?: Message[];
		events?: SystemEvent[];
		timelineSegments?: TimelineSegment[];
		onSendMessage?: (message: string) => void;
	}

	let { ticket, messages = [], events = [], timelineSegments = [], onSendMessage = () => {} }: Props = $props();
</script>

<active-conversation-detail-column>
	<ConversationHeader {ticket} />
	<MessagesArea {timelineSegments} {messages} />

	<MessageInput {onSendMessage} />
</active-conversation-detail-column>

<style>
	active-conversation-detail-column {
		display: flex;
		flex-direction: column;
		height: 100%;
		border-radius: 0.5em;
		box-shadow: var(--card);
		background: light-dark(hsl(0, 0%, 95%), hsl(0, 0%, 8%));
		position: relative;
	}
</style>
