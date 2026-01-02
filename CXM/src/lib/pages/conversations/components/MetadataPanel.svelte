<script lang="ts">
	import StatusSwitch from "./StatusSwitch.svelte";
	import AiIntelligenceDisplay from "./AiIntelligenceCard.svelte";
	import ContextDataCard from "./ContextDataCard.svelte";
	import TagsInput from "./TagsInput.svelte";
	import PrivateNotes from "./PrivateNotes.svelte";
	import type { Ticket } from "../types/conversations.js";

	interface Props {
		ticket?: Ticket;
		onStatusChange?: (ticketId: string, status: string) => void;
		onTagsChange?: (ticketId: string, tags: string[]) => void;
		onNotesChange?: (ticketId: string, notes: string) => void;
	}

	let { ticket, onStatusChange = () => {}, onTagsChange = () => {}, onNotesChange = () => {} }: Props = $props();

	let tags = $state(["Item"]);
	let notes = $state("Customer called regarding Order #123. He was upset about shipping delay. Offered 10% coupon.");
</script>

<active-conversation-metadata-column>
	{#if ticket}
		<StatusSwitch currentStatus={ticket.status} onChange={(status) => onStatusChange(ticket.id, status)} />

		<AiIntelligenceDisplay intent="Refund Request" aiTalkTime="30s" humanTime="53s" sentimentScore={85} />

		<ContextDataCard orderId="#12345" amount="₹1,299" date="Jan 10, 25" />

		<TagsInput bind:value={tags} onChange={(newTags) => onTagsChange(ticket.id, newTags)} />

		<PrivateNotes bind:value={notes} onChange={(newNotes) => onNotesChange(ticket.id, newNotes)} />
	{:else}
		<div class="no-selection">Select a conversation to view details</div>
	{/if}
</active-conversation-metadata-column>

<style>
	active-conversation-metadata-column {
		display: flex;
		flex-direction: column;
		height: 100%;
		border-radius: 0.5em;
		box-shadow: var(--card);
		background: light-dark(hsl(0, 0%, 95%), hsl(0, 0%, 8%));
		padding: 1em;
		gap: 0.5em;
		overflow-y: auto;

		.no-selection {
			display: flex;
			align-items: center;
			justify-content: center;
			height: 100%;
			color: light-dark(#999, #666);
			text-align: center;
			padding: 2em;
		}
	}
</style>
