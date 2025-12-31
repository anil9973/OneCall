<script lang="ts">
	interface Props {
		url: string;
		duration: string;
		waveform?: number[];
	}

	let { url, duration, waveform = [] }: Props = $props();

	let isPlaying = $state(false);

	function togglePlay() {
		isPlaying = !isPlaying;
	}
</script>

<audio-transcript-player>
	<button onclick={togglePlay} title={isPlaying ? "Pause" : "Play"}>
		<svg class="icon">
			<use href="/public/icons.svg#{isPlaying ? 'pause' : 'play'}"></use>
		</svg>
	</button>

	<div class="audio-waveform" data-playing={isPlaying}>
		{#if waveform.length > 0}
			{#each waveform as amplitude, i}
				<div class="waveform-bar" style="height: {amplitude * 100}%"></div>
			{/each}
		{:else}
			<img src="/assets/waveform.jpg" alt="Audio waveform" />
		{/if}
	</div>

	<span class="duration">{duration}</span>
</audio-transcript-player>

<style>
	audio-transcript-player {
		display: flex;
		align-items: center;
		gap: 0.5em;
		padding: 0.5em;
		border-top: var(--border);

		button {
			flex-shrink: 0;
			width: 2em;
			height: 2em;
			border-radius: 50%;
			box-shadow: var(--neu-flat);
			background: light-dark(#f0f0f0, #2a2a2a);
			display: flex;
			align-items: center;
			justify-content: center;

			&:active {
				box-shadow: var(--neu-pressed);
			}
		}

		.audio-waveform {
			flex: 1;
			height: 2em;
			display: flex;
			align-items: center;
			gap: 0.125em;
			overflow: hidden;

			img {
				height: 100%;
				width: 100%;
				object-fit: cover;
			}

			.waveform-bar {
				flex: 1;
				min-width: 0.125em;
				background: light-dark(#ccc, #555);
				border-radius: 0.125em;
				transition: background 200ms ease;
			}

			&[data-playing="true"] .waveform-bar {
				background: light-dark(#3b82f6, #60a5fa);
			}
		}

		.duration {
			font-size: 0.75rem;
			color: light-dark(#666, #999);
			flex-shrink: 0;
		}
	}
</style>
