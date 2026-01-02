<script lang="ts">
	import type { TicketStatus } from "../types/conversations.js";

	interface Props {
		currentStatus: TicketStatus;
		onChange?: (status: TicketStatus) => void;
	}

	let { currentStatus, onChange = () => {} }: Props = $props();

	let selectedStatus = $state(currentStatus);

	$effect(() => {
		selectedStatus = currentStatus;
	});

	function handleChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		const newStatus = target.value as TicketStatus;
		selectedStatus = newStatus;
		onChange(newStatus);
	}
</script>

<ticket-status-switch>
	<div>Current Status</div>
	<select value={selectedStatus} onchange={handleChange}>
		<option value="new">New</option>
		<option value="pending">Pending</option>
		<option value="escalated">Escalated</option>
		<option value="resolved">Resolved</option>
	</select>
</ticket-status-switch>

<style>
	ticket-status-switch {
		display: flex;
		flex-direction: column;
		gap: 0.5em;

		div {
			font-size: small;
			color: light-dark(#666, #999);
		}
	}

	select {
		width: 100%;
		padding: 0.5em;
		border: none;
		border-radius: 0.5em;
		box-shadow: var(--card);
		background-color: light-dark(white, black);
		cursor: pointer;
		font-size: 0.9rem;

		&:focus {
			outline: none;
			box-shadow: var(--neu-pressed);
		}
	}
</style>
