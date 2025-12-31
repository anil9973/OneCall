<script lang="ts">
	import ConversationWorkspace from "./ConversationWorkspace.svelte";
	import {
		MOCK_TICKETS,
		MOCK_MESSAGES,
		MOCK_SYSTEM_EVENTS,
		MOCK_TIMELINE_SEGMENTS,
	} from "../../../data/mock-data.js";

	let selectedTicketId = $state("ticket-1");

	function handleTicketSelect(ticketId: string) {
		selectedTicketId = ticketId;
		console.log("Selected ticket:", ticketId);
	}

	function handleSendMessage(message: string) {
		console.log("Send message:", message);
	}

	function handleStatusChange(ticketId: string, status: string) {
		console.log("Status changed:", ticketId, status);
	}

	function handleTagsChange(ticketId: string, tags: string[]) {
		console.log("Tags changed:", ticketId, tags);
	}

	function handleNotesChange(ticketId: string, notes: string) {
		console.log("Notes changed:", ticketId, notes);
	}
</script>

<ConversationWorkspace
	tickets={MOCK_TICKETS}
	bind:selectedTicketId
	messages={MOCK_MESSAGES}
	events={MOCK_SYSTEM_EVENTS}
	timelineSegments={MOCK_TIMELINE_SEGMENTS}
	onTicketSelect={handleTicketSelect}
	onSendMessage={handleSendMessage}
	onStatusChange={handleStatusChange}
	onTagsChange={handleTagsChange}
	onNotesChange={handleNotesChange}
/>
