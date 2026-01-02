<script lang="ts">
	import type { Message, TimelineSegment } from "../types/conversations.js";
	import MessageBubble from "./MessageBubble.svelte";
	import TimelineBar from "./TimelineBar.svelte";

	interface Props {
		messages?: Message[];
		timelineSegments?: TimelineSegment[];
		onSendMessage?: (message: string) => void;
	}

	let { messages = [], timelineSegments = [] }: Props = $props();
</script>

<messages-display-area>
	<TimelineBar segments={timelineSegments} />

	<messages-history-scrollable-list>
		{#each messages as message (message.id)}
			<MessageBubble {message} />
		{/each}
	</messages-history-scrollable-list>
</messages-display-area>

<style>
	messages-display-area {
		flex-grow: 1;
		display: flex;
		column-gap: 0.8em;
		padding: 0.5em;
		overflow-y: auto;
		scrollbar-width: thin;

		messages-history-scrollable-list {
			flex: 1;
			display: flex;
			flex-direction: column;
			row-gap: 0.5em;
		}
	}
</style>
