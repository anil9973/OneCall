<script lang="ts">
	import type { Ticket } from "../types/conversations.js";

	interface Props {
		ticket?: Ticket;
	}

	let { ticket }: Props = $props();
</script>

<atv-conversation-header-bar>
	<div>{ticket?.title || "Select a conversation"}</div>
	<button title="More options">
		<svg class="icon">
			<use href="/public/icons.svg#menu"></use>
		</svg>
	</button>
</atv-conversation-header-bar>

<style>
	atv-conversation-header-bar {
		display: flex;
		column-gap: 0.5em;
		padding: 0.3em 0.5em;
		border-radius: 0.5em 0.5em 0 0;
		box-shadow: var(--card);
		background: light-dark(hsl(0, 0%, 90%), hsl(0, 0%, 10%));

		button {
			margin-left: auto;
		}
	}
</style>
