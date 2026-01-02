<script lang="ts">
	let isRecording = $state(false);
	function toggleRecording() {
		isRecording = !isRecording;
	}
</script>

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

<style>
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
</style>
