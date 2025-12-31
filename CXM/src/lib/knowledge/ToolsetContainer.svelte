<script lang="ts">
	import HttpToolBox from "./HttpToolBox.svelte";
	import type { HttpTool } from "./types/knowledge.js";

	interface Props {
		tools: HttpTool[];
		onToolUpdate?: (tool: HttpTool) => void;
	}

	let { tools, onToolUpdate = () => {} }: Props = $props();
</script>

<toolset-container>
	<tool-list>
		{#each tools as tool (tool.id)}
			<HttpToolBox {tool} onUpdate={onToolUpdate} />
		{/each}
	</tool-list>
</toolset-container>

<style>
	toolset-container {
		display: block;
		height: 93vh;
		padding: 0.5em;
		border-radius: 0 1em 1em 1em;
		box-shadow: var(--card);
		background-color: light-dark(white, black);
		animation: fade-in 300ms ease-out;
	}

	tool-list {
		display: flex;
		flex-direction: column;
		gap: 1em;
		padding: 1em;
		height: 100%;
		overflow-y: auto;
		scrollbar-width: thin;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(-0.5em);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
