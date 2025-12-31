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
	<header>Tool</header>

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
		animation: tool-slide-in 400ms ease-out;
		transition: box-shadow 200ms ease;

		&:hover {
			box-shadow: 0 0.25em 0.75em light-dark(rgba(0, 0, 0, 0.15), rgba(200, 200, 200, 0.3));
		}

		header {
			padding: 0.3em 1em;
			border-radius: 0.5em 0.5em 0 0;
			box-shadow: var(--card);
			background-color: light-dark(whitesmoke, hsl(0, 0%, 10%));
			font-weight: 600;
			transition: background 200ms ease;

			&:hover {
				background-color: light-dark(#e8e8e8, hsl(0, 0%, 12%));
			}
		}

		tool-body {
			display: flex;
			justify-content: space-between;
			gap: 1em;
			padding: 1em;
		}
	}

	@keyframes tool-slide-in {
		from {
			opacity: 0;
			transform: translateY(1em);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
