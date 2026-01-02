<script lang="ts">
	import { onMount } from "svelte";
	import ConversationWorkspace from "./components/ConversationWorkspace.svelte";
	import { conversationStore, selectedMessages, selectedEvents, selectedTimeline } from "./stores/conversation.store";
	import { authStore } from "./stores/auth.store";
	import { domainStore } from "./stores/domain.store";

	let selectedTicketId = $state("");

	onMount(async () => {
		await authStore.init();

		if ($authStore.user) {
			await domainStore.load();
			await conversationStore.load();
		}
	});

	function handleTicketSelect(ticketId: string) {
		selectedTicketId = ticketId;
		conversationStore.select(ticketId);
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

	async function handleLogout() {
		await authStore.logout();
	}
</script>

<ConversationWorkspace
	tickets={$conversationStore.list}
	bind:selectedTicketId
	messages={$selectedMessages}
	events={$selectedEvents}
	timelineSegments={$selectedTimeline}
	onTicketSelect={handleTicketSelect}
	onSendMessage={handleSendMessage}
	onStatusChange={handleStatusChange}
	onTagsChange={handleTagsChange}
	onNotesChange={handleNotesChange}
/>
