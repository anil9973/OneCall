<script lang="ts">
	interface Props {
		onSendMessage?: (message: string) => void;
	}

	let { onSendMessage = () => {} }: Props = $props();

	let messageText = $state("");
	let isRecording = $state(false);
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

	function toggleRecording() {
		isRecording = !isRecording;
	}

	const showSendButton = $derived(messageText.trim().length > 0);
	const showHelper = $derived(!showSendButton && messageText.length === 0);
</script>

<message-input-section>
	<mic-coin
		class={isRecording ? "listening" : ""}
		onclick={toggleRecording}
		role="button"
		tabindex="0"
		title={isRecording ? "Stop recording" : "Start recording"}
	>
		<div class="coin-ring">
			<svg class="icon mic-on">
				<use href="/public/icons.svg#mic-on"></use>
			</svg>
		</div>
	</mic-coin>

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
				<svg class="icon">
					<use href="/public/icons.svg#send"></use>
				</svg>
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

				svg {
					fill: white;
				}

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

		mic-coin {
			--size: 3em;
			--ring-width: 0.5em;
			position: absolute;
			right: -1.2em;
			top: -1.4em;
			border-radius: 50%;
			height: var(--size);
			inline-size: var(--size);
			box-shadow: var(--card);
			padding: var(--ring-width);
			background-color: light-dark(hsl(0, 0%, 100%), rgb(60, 60, 60));
			z-index: 40;
			cursor: pointer;

			.coin-ring {
				border-radius: 50%;
				height: calc(var(--size) - var(--ring-width) * 2);
				inline-size: calc(var(--size) - var(--ring-width) * 2);
				box-shadow: var(--neu-pressed);
				padding: 0.2em;
				display: flex;
				justify-content: center;
				align-items: center;
			}

			&::before {
				content: "";
				position: absolute;
				inset: -0.125em;
				border-radius: 50%;
				padding: 0.25em;
				background-image: conic-gradient(
					from 0deg,
					transparent 0%,
					var(--gradient-color, transparent) 50%,
					transparent 100%
				);
				-webkit-mask:
					linear-gradient(#fff 0 0) content-box,
					linear-gradient(#fff 0 0);
				-webkit-mask-composite: xor;
				mask-composite: exclude;
				opacity: 1;
				z-index: -1;
			}

			&.listening {
				--gradient-color: rgb(239, 68, 68);

				&::before {
					animation: pulse-red 2s ease-in-out infinite;
				}

				.coin-ring {
					animation: pulse-red 2s ease-in-out infinite;
				}
			}

			&.speaking {
				--gradient-color: rgb(34, 197, 94);

				&::before {
					animation: pulse-red 1s ease-in-out infinite;
				}

				svg {
					animation: wave-green 0.5s ease-in-out infinite;
				}
			}
		}
	}
</style>
