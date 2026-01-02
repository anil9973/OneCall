<script lang="ts">
	import type { Snippet } from "svelte";

	interface Props {
		tabs: string[];
		onTabChange?: (tab: string) => void;
		headers_content?: Snippet;
		params_content?: Snippet;
	}

	let { tabs, onTabChange = () => {}, headers_content, params_content }: Props = $props();

	let activeTab = $state(tabs[0]);

	function handleTabClick(tab: string) {
		activeTab = tab;
		onTabChange(tab);
	}

	const snippets = $derived({
		Headers: headers_content,
		Params: params_content,
	});
</script>

<tabular-carousel>
	<tab-strip-row>
		{#each tabs as tab}
			<div class:active={activeTab === tab} onclick={() => handleTabClick(tab)} role="tab" tabindex="0">
				{tab}
			</div>
		{/each}
	</tab-strip-row>

	<carousel-body>
		{#if snippets[activeTab]}
			{@render snippets[activeTab]?.()}
		{/if}
	</carousel-body>
</tabular-carousel>

<style>
	tabular-carousel {
		display: block;
	}

	tab-strip-row {
		display: flex;
		border-radius: 0.5em 0.5em 0 0;
		box-shadow: var(--card);
		background-color: light-dark(whitesmoke, hsl(0, 0%, 15%));
		overflow: hidden;

		div {
			flex-grow: 1;
			padding-block: 0.4em;
			text-align: center;
			cursor: pointer;
			font-size: 0.9rem;
			transition: all 200ms ease;
			position: relative;

			&:hover {
				background-color: light-dark(#e8e8e8, hsl(0, 0%, 18%));
			}

			&.active {
				background-color: light-dark(white, hsl(0, 0%, 5%));
				font-weight: 600;

				&::after {
					content: "";
					position: absolute;
					bottom: 0;
					left: 0;
					right: 0;
					height: 0.125em;
					background: linear-gradient(90deg, #ff00ff, #00ffff);
				}
			}
		}
	}

	carousel-body {
		display: block;
		padding: 0.5em;
		overflow-x: hidden;
		border: var(--border);
		border-top: none;
		border-radius: 0 0 0.5em 0.5em;
		animation: fade-in 200ms ease-out;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
