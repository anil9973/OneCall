<script lang="ts">
	import { getRoleIcon, getStatusIcon } from "../utils/helpers.js";
	import type { Ticket } from "../types/conversations.js";

	interface Props {
		ticket: Ticket;
		selected?: boolean;
		onClick?: () => void;
	}

	let { ticket, selected = false, onClick = () => {} }: Props = $props();
</script>

<conversation-ticket-card
	data-status={ticket.status}
	data-selected={selected}
	onclick={onClick}
	role="button"
	tabindex="0"
	onkeydown={(e) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			onClick();
		}
	}}
>
	<div class="title-line">
		<span>
			<svg class="icon speaker">
				<use href="/public/icons.svg#{ticket.status}"></use>
			</svg>
			<span class="title">{ticket.title}</span>
		</span>
		<time datetime={ticket.timestampAbsolute.toISOString()}>
			{ticket.timestamp}
		</time>
	</div>

	<div class="last-message-line">
		<svg class="icon speaker">
			<use href="/public/icons.svg#{ticket.lastMessageRole === 'user' ? 'customer' : 'ai'}"></use>
		</svg>
		<svg class="icon">
			<use href="/public/icons.svg#question"></use>
		</svg>
		<span class="last-message-text">{ticket.lastMessagePreview}</span>
	</div>

	<div class="status-line">
		<span>
			<svg class="icon">
				<use href="/public/icons.svg#{ticket.category === 'Refund' ? 'dollar' : 'bookmark'}"></use>
			</svg>
			<span class="category">{ticket.category}</span>
		</span>

		<span data-status={ticket.status}>
			<svg class="icon">
				<use href="/public/icons.svg#alert"></use>
			</svg>
			<span class="status-label">{ticket.statusText}</span>
		</span>
	</div>
</conversation-ticket-card>

<style>
	conversation-ticket-card {
		display: flex;
		flex-direction: column;
		row-gap: 0.5em;
		padding: 0.5em;
		border-radius: 0.5em;
		box-shadow: var(--card);
		background: light-dark(hsl(0, 0%, 100%), black);
		transition: translate 200ms ease-out;
		cursor: pointer;

		&:hover {
			translate: 0 -0.125em;
		}

		&[data-selected="true"] {
			box-shadow: var(--neu-pressed);
		}

		.last-message-line {
			line-clamp: 1;
			display: -webkit-box;
			-webkit-line-clamp: 1;
			-webkit-box-orient: vertical;
			overflow: hidden;
		}

		.title-line,
		.status-line {
			display: flex;
			justify-content: space-between;
			align-items: center;
		}

		span {
			vertical-align: middle;
			font-size: 0.9rem;
		}

		.speaker + svg {
			margin-left: -0.625em;
		}
	}
</style>
