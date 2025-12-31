<script lang="ts">
	import TicketCard from "./TicketCard.svelte";
	import type { Ticket } from "../types/conversations.js";

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
	<ticket-list-header>
		<support-ticket-search-card>
			<search>
				<select bind:value={statusFilter}>
					<option value="all">All Status</option>
					<option value="new">New</option>
					<option value="pending">Pending</option>
					<option value="escalated">Escalated</option>
					<option value="resolved">Resolved</option>
				</select>
				<input type="text" placeholder="🔎 search" bind:value={searchQuery} />
			</search>
		</support-ticket-search-card>
	</ticket-list-header>

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

	ticket-list-header support-ticket-search-card {
		display: block;
		margin: 0.5em 1em;
		border-radius: 1em;
		box-shadow: var(--card);

		search {
			display: flex;
			border-radius: 1em;
			padding: 0.3125em;
			box-shadow: var(--neu-pressed);
			background: light-dark(white, black);
		}

		select {
			border: none;
			background: none;
			cursor: pointer;
		}

		input {
			border: none;
			border-radius: 1em;
			padding: 0.5em;
			background: none;
			width: 100%;

			&:focus {
				outline: none;
			}
		}
	}
</style>
