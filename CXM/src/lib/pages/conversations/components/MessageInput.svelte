<script lang="ts">
	import Icon from "../../components/Icon.svelte";
	import MicButton from "./MicButton.svelte";

	interface Props {
		onSendMessage?: (message: string) => void;
	}

	let { onSendMessage = () => {} }: Props = $props();

	let messageText = $state("");

	let isInternal = $state(false);

	function handleSend() {
		if (messageText.trim()) {
			onSendMessage(messageText);
			messageText = "";
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLElement;
		messageText = target.textContent || "";
		isInternal = messageText.startsWith("#");
	}

	const showSendButton = $derived(messageText.trim().length > 0);
	const showHelper = $derived(!showSendButton && messageText.length === 0);
</script>

<message-input-section>
	<MicButton />

	<message-compose-wrapper>
		<message-compose-input-field>
			<section
				contenteditable="true"
				placeholder="Type your response or start with # for internal note..."
				data-mode={isInternal ? "internal" : "message"}
				oninput={handleInput}
				onkeydown={handleKeydown}
				role="textbox"
				aria-multiline="true"
			></section>

			<button class="send-btn" hidden={!showSendButton} onclick={handleSend} title="Send message">
				<Icon name="send" />
			</button>

			<div class="input-helper-text" hidden={!showHelper}>💡 Tip: Start with # for internal note</div>
		</message-compose-input-field>
	</message-compose-wrapper>
</message-input-section>

<style>
	message-input-section {
		margin-inline: auto;
		margin-bottom: 1em;
		position: relative;

		message-compose-wrapper {
			--hole-size: 2.25em;
			display: flex;
			width: 37.5em;
			height: 5lh;
			padding: 0.4em;
			border: var(--border);
			border-radius: 0.8em 1.5em 0.8em 0.8em;
			background-color: light-dark(white, black);
			mask-image: radial-gradient(circle var(--hole-size) at top right, transparent 98%, black 100%);
		}
	}

	message-compose-input-field {
		--block-sdw-clr: 160 160 160;
		width: 100%;
		border-radius: 0.8em 1.5em 0.8em 0.8em;
		border: var(--border);
		box-shadow:
			inset -3px 3px 3px 0px rgb(var(--block-sdw-clr) / 0.5),
			inset 3px -3px 3px 0px rgb(var(--block-sdw-clr) / 0.5);
		background-color: light-dark(white, black);
		mask-image: radial-gradient(circle var(--hole-size) at top right, transparent 98%, black 100%);
		position: relative;

		section[contenteditable="true"] {
			padding: 0.5em;
			min-height: 3em;
			max-height: 10em;
			overflow-y: auto;
			outline: none;

			&:empty::before {
				content: attr(placeholder);
				color: light-dark(#999, #666);
			}

			&[data-mode="internal"] {
				background: light-dark(rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.2));
			}
		}

		.send-btn {
			position: absolute;
			bottom: 0.2em;
			right: -0.2em;
			width: 2.5em;
			height: 2.5em;
			border-radius: 50%;
			box-shadow: var(--neu-flat);
			background: light-dark(#3b82f6, #2563eb);
			display: flex;
			align-items: center;
			justify-content: center;

			&:active {
				box-shadow: var(--neu-pressed);
			}
		}

		.input-helper-text {
			font-size: 0.7rem;
			color: light-dark(#666, #999);
			position: absolute;
			bottom: 0.3em;
			left: 0.5em;
		}
	}
</style>
