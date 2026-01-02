<script lang="ts">
	interface Props {
		intent: string;
		aiTalkTime: string;
		humanTime: string;
		sentimentScore: number;
	}

	let { intent, aiTalkTime, humanTime, sentimentScore }: Props = $props();

	const sentimentLabel = $derived(sentimentScore < 30 ? "Calm" : sentimentScore < 70 ? "Neutral" : "Frustrated");
</script>

<ai-intelligence-display>
	<div class="ai-header-row">
		<span style="font-weight:700">💰 {intent}</span>
		<span class="ai-badge">AI DETECTED</span>
	</div>

	<div class="sentiment-track" title="Customer Sentiment Score: {sentimentScore}/100">
		<div class="sentiment-fill" style="width: {sentimentScore}%"></div>
	</div>

	<div class="sentiment-labels">
		<span>Calm</span>
		<span class="frustrated">Frustrated</span>
	</div>

	<hr class="divider" />

	<div class="key-value-row">
		<span class="key">⏱️ AI Talk Time</span>
		<span class="val">{aiTalkTime}</span>
	</div>

	<div class="key-value-row">
		<span class="key">👤 Human Time</span>
		<span class="val">{humanTime}</span>
	</div>
</ai-intelligence-display>

<style>
	ai-intelligence-display {
		display: block;
		background: light-dark(white, black);
		padding: 1em;
		border-radius: 0.5em;
		box-shadow: var(--card);
		border: 0.0625em solid light-dark(rgba(0, 0, 0, 0.05), rgba(255, 255, 255, 0.03));
		transition: translate 200ms ease-out;

		&:hover {
			translate: 0 -2px;
		}
	}

	.ai-header-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75em;

		.ai-badge {
			font-size: 0.65rem;
			padding: 0.25em 0.5em;
			border-radius: 0.25em;
			background: light-dark(rgba(124, 58, 237, 0.1), rgba(139, 92, 246, 0.15));
			color: light-dark(#7c3aed, #a78bfa);
			border: 0.0625em solid light-dark(rgba(124, 58, 237, 0.2), rgba(139, 92, 246, 0.3));
			font-weight: 600;
		}
	}

	.sentiment-track {
		height: 0.375em;
		background: light-dark(#d4d4d8, #3f3f46);
		border-radius: 0.1875em;
		overflow: hidden;
		margin: 0.75em 0;

		& .sentiment-fill {
			height: 100%;
			background: linear-gradient(90deg, #fbbf24, #ef4444);
			transition: width 300ms ease;
		}
	}

	.sentiment-labels {
		display: flex;
		justify-content: space-between;
		font-size: 0.7rem;
		color: light-dark(#666, #999);
		margin-bottom: 0.75em;

		.frustrated {
			color: light-dark(#ef4444, #f87171);
		}
	}

	.divider {
		border: none;
		border-top: 0.0625em solid light-dark(#e5e5e5, #3f3f46);
		margin: 0.75em 0;
	}

	.key-value-row {
		display: flex;
		justify-content: space-between;
		font-size: 0.85rem;
		margin-bottom: 0.5em;

		&:last-child {
			margin-bottom: 0;
		}

		.key {
			color: light-dark(#666, #999);
		}

		.val {
			font-family: monospace;
			font-weight: 600;
		}
	}
</style>
