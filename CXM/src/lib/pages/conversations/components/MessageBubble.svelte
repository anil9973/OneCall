<script lang="ts">
	import AudioPlayer from "./AudioPlayer.svelte";
	import type { Message } from "../types/conversations.js";

	interface Props {
		message: Message;
	}

	let { message }: Props = $props();

	const alignClass = $derived(message.role === "user" ? "left" : "right");

	const senderLabel = $derived(
		message.role === "user" ? "Customer" : message.role === "assistant" ? "AI Assistant" : "System"
	);
</script>

<message-bubble-wrapper data-sender={message.role} data-align={alignClass}>
	<div class="message-content-card">
		<blockquote class="message-text">
			{message.content}
		</blockquote>

		{#if message.audioUrl}
			<AudioPlayer
				url={message.audioUrl}
				duration={message.audioDuration || "0:00"}
				waveform={message.audioWaveform || []}
			/>
		{/if}
	</div>

	<div class="message-status">
		<span>{senderLabel} replied</span>
		<time datetime={message.timestamp}>{message.timestamp}</time>
	</div>
</message-bubble-wrapper>

<style>
	message-bubble-wrapper {
		display: flex;
		flex-direction: column;
		max-width: 80%;

		&[data-align="left"] {
			align-self: flex-start;
		}

		&[data-align="right"] {
			align-self: flex-end;
		}
	}

	.message-content-card {
		border-radius: 0.5em;
		box-shadow: var(--card);
		background: light-dark(white, hsl(0, 0%, 10%));
		transition: translate 200ms ease-out;

		&:hover {
			translate: 0 -0.125em;
		}
	}

	blockquote.message-text {
		margin: 0;
		padding: 0.5em;
		font-size: 0.9rem;
	}

	.message-status {
		display: flex;
		justify-content: space-between;
		font-size: 0.8rem;
		padding: 0.125em 0.5em;
		color: light-dark(#666, #999);
	}
</style>
