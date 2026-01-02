<script lang="ts">
	import Icon from "../conversations/components/Icon.svelte";
	import HttpRequestEditor from "./HttpRequestEditor.svelte";
	import HttpResponseEditor from "./HttpResponseEditor.svelte";

	import type { HttpMethod, KeyValuePair } from "./types/knowledge.js";

	interface Props {
		method?: HttpMethod;
		url?: string;
		headers?: KeyValuePair[];
		params?: KeyValuePair[];
		responseSchema?: string;
		responseBody?: string;
		onExecute?: () => void;
		onMethodChange?: (method: HttpMethod) => void;
		onUrlChange?: (url: string) => void;
		onHeadersChange?: (headers: KeyValuePair[]) => void;
		onParamsChange?: (params: KeyValuePair[]) => void;
		onResponseSchemaChange?: (schema: string) => void;
	}

	let {
		method = $bindable("GET"),
		url = $bindable(""),
		headers = $bindable([]),
		params = $bindable([]),
		responseSchema = $bindable(""),
		responseBody = "",
		onExecute = () => {},
		onMethodChange = () => {},
		onUrlChange = () => {},
		onHeadersChange = () => {},
		onParamsChange = () => {},
		onResponseSchemaChange = () => {},
	}: Props = $props();

	let isExecuting = $state(false);
	let showRequest = $state(true);
	let showResponse = $state(false);

	function handleExecute() {
		isExecuting = true;
		onExecute();
		setTimeout(() => {
			isExecuting = false;
			showResponse = true;
		}, 1000);
	}

	function handleMethodChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		method = target.value as HttpMethod;
		onMethodChange(method);
	}

	function handleUrlChange(e: Event) {
		const target = e.target as HTMLInputElement;
		url = target.value;
		onUrlChange(url);
	}
</script>

<tool-http-api-editor>
	<label>
		<div>Request URL</div>
		<div class="url-input-field">
			<div class="url-field-wrapper">
				<select value={method} onchange={handleMethodChange}>
					<option value="GET">GET</option>
					<option value="POST">POST</option>
					<option value="PUT">PUT</option>
					<option value="DELETE">DELETE</option>
				</select>
				<input type="url" value={url} oninput={handleUrlChange} placeholder="https://api.example.com/data" />
				<button onclick={handleExecute} disabled={isExecuting} title="Execute request">
					<Icon name="run" />
				</button>
			</div>
		</div>
	</label>

	<div class="request-response-editor">
		<details name="http-tool-1" open={showRequest}>
			<summary>Request</summary>
			<HttpRequestEditor bind:headers bind:params {onHeadersChange} {onParamsChange} />
		</details>

		<details name="http-tool-1" open={showResponse}>
			<summary>Response</summary>
			<HttpResponseEditor bind:responseSchema {responseBody} {isExecuting} onSchemaChange={onResponseSchemaChange} />
		</details>
	</div>
</tool-http-api-editor>

<style>
	tool-http-api-editor {
		flex: 1;
		padding: 0.5em;
		border-radius: 0.5em;
		box-shadow: var(--card);
		background-color: light-dark(white, black);

		label {
			display: block;
			margin-bottom: 0.8em;

			& > div:first-child {
				font-size: 0.9rem;
				color: light-dark(#666, #999);
				margin-bottom: 0.5em;
			}
		}
	}

	.url-input-field {
		border-radius: 0.8em;
		box-shadow: var(--card);
		background-color: light-dark(white, black);

		.url-field-wrapper {
			display: flex;
			align-items: center;
			padding-inline: 0.5em;
			border-radius: 0.8em;
			background-color: light-dark(white, black);
			box-shadow: var(--neu-pressed);

			&:focus-within {
				background-color: light-dark(white, black);
			}
		}

		select {
			border: none;
			background: none;
			padding: 0.5em;
			cursor: pointer;
			font-weight: 600;

			&:focus {
				outline: none;
			}
		}

		input {
			flex-grow: 1;
			border: none;
			border-radius: 0.8em;
			padding: 0.5em;
			font-size: inherit;
			background: none;
		}

		button {
			padding: 0.5em;
			border: none;
			background: none;
			cursor: pointer;
			transition: scale 200ms ease;

			&:disabled {
				opacity: 0.5;
				cursor: not-allowed;
			}

			&:hover:not(:disabled) {
				scale: 1.2;
			}

			&:active:not(:disabled) {
				scale: 0.9;
			}
		}
	}

	.request-response-editor {
		display: flex;
		column-gap: 0.5em;
		margin-block: 0.8em;
	}

	details {
		margin: 0;
		min-height: 10lh;
		border-radius: 0.5em;
		box-shadow: var(--card);
		background-color: light-dark(rgb(252, 233, 233), hsl(0, 0%, 10%));

		&::details-content {
			transition:
				width 0.5s ease,
				content-visibility 0.5s ease allow-discrete;
			width: 0;
			overflow: clip;
		}

		&[open]::details-content {
			width: auto;
		}

		& summary {
			list-style-type: none;
		}

		&:not([open]) summary {
			display: flex;
			align-items: center;
			justify-content: center;
			column-gap: 0.5em;
			padding: 1em 0.5em;
			font-weight: bold;
			writing-mode: vertical-rl;
			transform: scale(-1, -1);
			cursor: pointer;
		}

		&[open] {
			flex-grow: 1;

			& summary {
				display: none;
			}
		}
	}
</style>
