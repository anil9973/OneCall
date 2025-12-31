<script lang="ts">
	interface Props {
		value?: string;
		onChange?: (notes: string) => void;
	}

	let { value = $bindable(""), onChange = () => {} }: Props = $props();

	function handleInput(e: Event) {
		const target = e.target as HTMLElement;
		value = target.textContent || "";
		onChange(value);
	}
</script>

<private-notes>
	<label>🔒 Private Notes</label>

	<div class="note-well">
		<section
			contenteditable="true"
			placeholder="Type internal notes here... (Customer cannot see this)"
			oninput={handleInput}
			role="textbox"
			aria-multiline="true"
		>
			{value}
		</section>
	</div>
</private-notes>

<style>
	private-notes {
		display: flex;
		flex-direction: column;
		gap: 0.5em;

		label {
			margin-left: 0.125em;
			font-size: 0.9rem;
			color: light-dark(#666, #999);
		}

		.note-well {
			padding: 0.4em;
			border-radius: 0.5em;
			box-shadow: var(--card);
			background-color: light-dark(white, black);
		}

		section[contenteditable="true"] {
			--block-sdw-clr: 160 160 160;
			font-family: monospace;
			min-height: 5lh;
			padding: 0.4em;
			border-radius: 0.5em;
			background-color: light-dark(white, black);
			box-shadow:
				inset -3px 3px 3px 0px rgb(var(--block-sdw-clr) / 0.5),
				inset 3px -3px 3px 0px rgb(var(--block-sdw-clr) / 0.5);
			font-size: 0.85rem;
			line-height: 1.5;
			outline: none;

			&:empty::before {
				content: attr(placeholder);
				color: light-dark(#999, #666);
			}
		}
	}
</style>
