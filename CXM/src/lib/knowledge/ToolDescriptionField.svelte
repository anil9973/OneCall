<!-- src/lib/components/ToolDescriptionField.svelte -->
<script lang="ts">
	interface Props {
		value?: string;
		onChange?: (value: string) => void;
	}

	let { value = $bindable(""), onChange = () => {} }: Props = $props();

	function handleInput(e: Event) {
		const target = e.target as HTMLTextAreaElement;
		value = target.value;
		onChange(value);
	}
</script>

<tool-description-field>
	<label>Tool description</label>
	<div class="description-field">
		<div class="markdown-field-wrapper">
			<markdown-editor>
				<textarea bind:value oninput={handleInput} placeholder="Describe what this tool does..."></textarea>
			</markdown-editor>
		</div>
	</div>
</tool-description-field>

<style>
	tool-description-field {
		flex: 1;

		label {
			font-size: 0.9rem;
			color: light-dark(#666, #999);
			margin-bottom: 0.5em;
			display: block;
		}

		.description-field {
			padding: 0.5em;
			border-radius: 0.5em;
			box-shadow: var(--card);
			background-color: light-dark(white, black);
			transition: box-shadow 200ms ease;

			&:focus-within {
				box-shadow: 0 0.25em 0.5em light-dark(rgba(0, 0, 0, 0.15), rgba(200, 200, 200, 0.3));
			}
		}

		.markdown-field-wrapper {
			--block-sdw-clr: 160 160 160;
			border-radius: 0.5em;
			background-color: light-dark(white, black);
			box-shadow:
				inset -0.1875em 0.1875em 0.1875em 0 rgb(var(--block-sdw-clr) / 0.5),
				inset 0.1875em -0.1875em 0.1875em 0 rgb(var(--block-sdw-clr) / 0.5);
		}

		markdown-editor {
			display: block;

			textarea {
				display: block;
				width: 37.5em;
				height: 10lh;
				padding: 0.5em;
				border: none;
				border-radius: 0.5em;
				background: none;
				resize: vertical;
				font-family: inherit;
				transition: background 200ms ease;

				&:focus {
					outline: none;
					background: light-dark(#fafafa, rgba(255, 255, 255, 0.02));
				}
			}
		}
	}
</style>
