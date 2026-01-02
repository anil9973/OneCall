<script lang="ts">
	interface Props {
		responseSchema?: string;
		responseBody?: string;
		isExecuting?: boolean;
		onSchemaChange?: (schema: string) => void;
	}

	let {
		responseSchema = $bindable(""),
		responseBody = "",
		isExecuting = false,
		onSchemaChange = () => {},
	}: Props = $props();

	const hasExecuted = $derived(responseBody !== "");

	function handleSchemaChange(e: Event) {
		const target = e.target as HTMLTextAreaElement;
		responseSchema = target.value;
		onSchemaChange(responseSchema);
	}
</script>

<response-body-output>
	{#if isExecuting}
		<div class="loading">
			<div class="spinner"></div>
			<span>Executing request...</span>
		</div>
	{:else if hasExecuted}
		<div class="response-content">
			<div class="response-header">
				<span class="status-badge success">200 OK</span>
				<span class="response-time">124ms</span>
			</div>
			<pre class="response-body">{responseBody}</pre>
		</div>
	{:else}
		<json-schema-editor>
			<label>
				<span class="label-text">Response JSON Schema</span>
				<span class="helper-text">Define expected response structure</span>
			</label>
			<div class="schema-editor-wrapper">
				<textarea value={responseSchema} oninput={handleSchemaChange} placeholder=""></textarea>
			</div>
		</json-schema-editor>
	{/if}
</response-body-output>

<style>
	.loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1em;
		height: 15em;
		color: light-dark(#666, #999);

		.spinner {
			width: 2em;
			height: 2em;
			border: 0.25em solid light-dark(#e5e7eb, #374151);
			border-top-color: light-dark(#3b82f6, #60a5fa);
			border-radius: 50%;
			animation: spin 1s linear infinite;
		}
	}

	response-body-output {
		display: block;
		padding: 1em;
		min-height: 10em;

		.response-content {
			animation: fade-in 300ms ease-out;

			.response-header {
				display: flex;
				align-items: center;
				gap: 1em;
				margin-bottom: 0.5em;
				padding-bottom: 0.5em;
				border-bottom: 0.0625em solid light-dark(#e5e7eb, #374151);

				.status-badge {
					padding: 0.25em 0.75em;
					border-radius: 0.25em;
					font-size: 0.85rem;
					font-weight: 600;

					&.success {
						background: light-dark(#d1fae5, rgba(16, 185, 129, 0.2));
						color: light-dark(#065f46, #6ee7b7);
					}
				}

				.response-time {
					font-size: 0.85rem;
					color: light-dark(#6b7280, #9ca3af);
					font-family: monospace;
				}
			}

			.response-body {
				margin: 0;
				padding: 1em;
				border-radius: 0.5em;
				background: light-dark(#f9fafb, rgba(255, 255, 255, 0.03));
				font-size: 0.85rem;
				line-height: 1.6;
				overflow-x: auto;
				border: 0.0625em solid light-dark(#e5e7eb, #374151);
				transition: all 200ms ease;

				&:hover {
					background: light-dark(#f3f4f6, rgba(255, 255, 255, 0.05));
				}
			}
		}
	}

	json-schema-editor {
		display: block;
		animation: fade-in 300ms ease-out;

		label {
			display: flex;
			flex-direction: column;
			gap: 0.25em;
			margin-bottom: 0.75em;

			.label-text {
				font-size: 0.9rem;
				font-weight: 600;
				color: light-dark(#374151, #d1d5db);
			}

			.helper-text {
				font-size: 0.75rem;
				color: light-dark(#6b7280, #9ca3af);
			}
		}

		.schema-editor-wrapper {
			--block-sdw-clr: 160 160 160;
			border-radius: 0.5em;
			background-color: light-dark(white, black);
			box-shadow:
				inset -3px 3px 3px 0px rgb(var(--block-sdw-clr) / 0.5),
				inset 3px -3px 3px 0px rgb(var(--block-sdw-clr) / 0.5);
			transition: background-color 200ms ease;

			&:focus-within {
				background-color: light-dark(hsl(0, 0%, 96%), black);
			}

			textarea {
				width: 100%;
				min-height: 15em;
				padding: 0.75em;
				border: none;
				border-radius: 0.5em;
				background: none;
				font-size: 0.85rem;
				line-height: 1.6;
				color: inherit;
				resize: vertical;
				transition: background 200ms ease;

				&:focus {
					outline: none;
					background: light-dark(#fafafa, rgba(255, 255, 255, 0.02));
				}

				&::placeholder {
					color: light-dark(#9ca3af, #6b7280);
					opacity: 0.7;
				}
			}
		}
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(0.5em);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
