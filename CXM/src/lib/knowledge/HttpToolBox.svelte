<script lang="ts">
	import ToolDescriptionField from "./ToolDescriptionField.svelte";
	import HttpApiEditor from "./HttpApiEditor.svelte";
	import type { HttpTool } from "./types/knowledge.js";

	interface Props {
		tool: HttpTool;
		onUpdate?: (tool: HttpTool) => void;
	}

	let { tool, onUpdate = () => {} }: Props = $props();

	let description = $state(tool.description);
	let method = $state(tool.method);
	let url = $state(tool.url);
	let headers = $state([...tool.headers]);
	let params = $state([...tool.params]);
	let responseSchema = $state(tool.responseSchema || "");

	function handleExecute() {
		console.log("Executing:", { method, url, headers, params });
		onUpdate({ ...tool, method, url, headers, params, description, responseSchema });
	}
</script>

<http-tool-box>
	<header><span>Tool</span></header>

	<tool-body>
		<ToolDescriptionField bind:value={description} />

		<HttpApiEditor
			bind:method
			bind:url
			bind:headers
			bind:params
			bind:responseSchema
			responseBody={tool.responseBody}
			onExecute={handleExecute}
		/>
	</tool-body>
</http-tool-box>

<style>
	http-tool-box {
		display: block;
		border-radius: 0.5em;
		box-shadow: var(--card);
		background-color: light-dark(hsl(275, 81%, 96%), hsl(0, 0%, 5%));
		animation: tool-slide-up 400ms ease-out;
		animation-delay: calc(100ms * sibling-index());
		position: relative;
		isolation: isolate;

		&::before {
			content: " ";
			position: absolute;
			inset: 0;
			z-index: -1;
			box-shadow: 0 0 0.7em 0 rgba(255, 81, 0, 0.5);
			border-radius: 0.4em;
			opacity: 0;
			transition: opacity 1000ms ease-in-out;
		}

		&:hover::before {
			opacity: 1;
		}
	}

	header {
		padding: 0.3em 1em;
		border-radius: 0.5em 0.5em 0 0;
		box-shadow: var(--card);
		background-color: light-dark(whitesmoke, hsl(0, 0%, 10%));

		& span {
			font-weight: 600;
		}
	}

	tool-body {
		display: flex;
		justify-content: space-between;
		gap: 1em;
		padding: 1em;
	}

	@keyframes tool-slide-up {
		from {
			opacity: 0;
			translate: 0 100%;
		}
		to {
			opacity: 1;
			translate: 0 0;
		}
	}
</style>
