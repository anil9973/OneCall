<script lang="ts">
	import TicketListColumn from "./TicketListPanel.svelte";
	import ConversationDetailColumn from "./ConversationDetailPanel.svelte";
	import MetadataColumn from "./MetadataPanel.svelte";
	import type { Ticket, Message, SystemEvent, TimelineSegment } from "../types/conversations.js";

	interface Props {
		tickets?: Ticket[];
		selectedTicketId?: string;
		messages?: Message[];
		events?: SystemEvent[];
		timelineSegments?: TimelineSegment[];
		onTicketSelect?: (ticketId: string) => void;
		onSendMessage?: (message: string) => void;
		onStatusChange?: (ticketId: string, status: string) => void;
		onTagsChange?: (ticketId: string, tags: string[]) => void;
		onNotesChange?: (ticketId: string, notes: string) => void;
	}

	let {
		tickets = [],
		selectedTicketId = $bindable(""),
		messages = [],
		events = [],
		timelineSegments = [],
		onTicketSelect = () => {},
		onSendMessage = () => {},
		onStatusChange = () => {},
		onTagsChange = () => {},
		onNotesChange = () => {},
	}: Props = $props();

	const selectedTicket = $derived(tickets.find((t) => t.id === selectedTicketId));
</script>

<conversation-container>
	<TicketListColumn {tickets} {selectedTicketId} onSelect={onTicketSelect} />

	<ConversationDetailColumn ticket={selectedTicket} {messages} {events} {timelineSegments} {onSendMessage} />

	<MetadataColumn ticket={selectedTicket} {onStatusChange} {onTagsChange} {onNotesChange} />
</conversation-container>

<style>
	conversation-container {
		display: grid;
		height: 100vh;
		width: 100vw;
		grid-template-columns: 18.75em 1fr 18.75em;
		padding: 0.5em;
		gap: 0.5em;
		overflow: hidden;
	}
</style>
