<script lang="ts">
	import MessageBubble from "./MessageBubble.svelte";
	import TimelineBar from "./TimelineBar.svelte";
	import MessageInput from "./MessageInput.svelte";
	import type { Ticket, Message, SystemEvent, TimelineSegment } from "../types/conversations";
	import ConversationHeader from "./ConversationHeader.svelte";

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
	<messages-display-area>
		<TimelineBar segments={timelineSegments} />

		<messages-history-scrollable-list>
			{#each messages as message (message.id)}
				<MessageBubble {message} />
			{/each}
		</messages-history-scrollable-list>
	</messages-display-area>

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

	messages-display-area {
		flex-grow: 1;
		display: flex;
		column-gap: 0.8em;
		padding: 0.5em;
		overflow-y: auto;

		messages-history-scrollable-list {
			flex: 1;
			display: flex;
			flex-direction: column;
			row-gap: 0.5em;
		}
	}
</style>
