<script lang="ts">
	import TicketCard from "./TicketCard.svelte";
	import type { Ticket } from "../types/conversations.js";
	import TicketSearchBar from "./TicketSearchBar.svelte";

	interface Props {
		tickets: Ticket[];
		selectedTicketId?: string;
		onSelect?: (ticketId: string) => void;
	}

	let { tickets = [], selectedTicketId = "", onSelect = () => {} }: Props = $props();

	let statusFilter = $state("all");
	let searchQuery = $state("");

	const filteredTickets = $derived(
		tickets.filter((ticket) => {
			const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
			const matchesSearch =
				searchQuery === "" ||
				ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				ticket.lastMessagePreview.toLowerCase().includes(searchQuery.toLowerCase());
			return matchesStatus && matchesSearch;
		})
	);
</script>

<ticket-list-column>
	<TicketSearchBar {statusFilter} {searchQuery} />
	<ticket-cards-scrollable-list>
		{#each filteredTickets as ticket (ticket.id)}
			<TicketCard {ticket} selected={ticket.id === selectedTicketId} onClick={() => onSelect(ticket.id)} />
		{/each}
	</ticket-cards-scrollable-list>
</ticket-list-column>

<style>
	ticket-list-column {
		display: flex;
		flex-direction: column;
		height: 100%;
		border-radius: 0.5em;
		box-shadow: var(--card);
		background: light-dark(hsl(0, 0%, 95%), hsl(0, 0%, 8%));
		position: relative;
	}

	ticket-cards-scrollable-list {
		flex: 1;
		overflow-y: auto;
		padding: 0.5em;
		display: flex;
		flex-direction: column;
		gap: 0.5em;
		scrollbar-width: thin;
	}
</style>
