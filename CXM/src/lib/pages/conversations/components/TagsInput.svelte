<script lang="ts">
	interface Props {
		value?: string[];
		onChange?: (tags: string[]) => void;
	}

	let { value = $bindable([]), onChange = () => {} }: Props = $props();

	let inputValue = $state("");
	let showDropdown = $state(false);

	const availableTags = ["refund", "shipping", "payment", "product", "account", "urgent"];

	const filteredTags = $derived(
		availableTags.filter((tag) => !value.includes(tag) && tag.toLowerCase().includes(inputValue.toLowerCase()))
	);

	function addTag(tag: string) {
		if (!value.includes(tag)) {
			value = [...value, tag];
			onChange(value);
		}
		inputValue = "";
		showDropdown = false;
	}

	function removeTag(tag: string) {
		value = value.filter((t) => t !== tag);
		onChange(value);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Enter" && inputValue.trim()) {
			e.preventDefault();
			addTag(inputValue.trim());
		}
	}
</script>

<multi-chip-select-field>
	<label>Tags</label>

	<div class="chip-input-box">
		<ul>
			{#each value as tag}
				<li class="chip-item" style="--hue: {Math.random() * 360}">
					<span>{tag}</span>
					<button onclick={() => removeTag(tag)} title="Remove tag" hidden>
						<svg class="icon">
							<use href="/public/icons.svg#close"></use>
						</svg>
					</button>
				</li>
			{/each}
		</ul>

		<input
			type="text"
			bind:value={inputValue}
			onfocus={() => (showDropdown = true)}
			onblur={() => setTimeout(() => (showDropdown = false), 200)}
			onkeydown={handleKeydown}
			placeholder="Add tag..."
		/>
	</div>

	{#if showDropdown && filteredTags.length > 0}
		<div class="multi-select-popup">
			{#each filteredTags as tag}
				<li onclick={() => addTag(tag)}>
					<input type="checkbox" checked={false} readonly />
					<span>{tag}</span>
				</li>
			{/each}
		</div>
	{/if}
</multi-chip-select-field>

<style>
	multi-chip-select-field {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.5em;

		label {
			margin-left: 0.125em;
			font-size: 0.9rem;
			color: light-dark(#666, #999);
		}
	}

	.multi-select-popup {
		display: block;
		width: 100%;
		padding: 0.5em;
		box-shadow: var(--card);
		border-radius: 0 0 0.5em 0.5em;
		background-color: light-dark(white, black);
		position: absolute;
		top: 100%;
		z-index: 10;
		max-height: 30vh;
		overflow-y: auto;
		scrollbar-width: thin;

		li {
			list-style-type: none;
			padding: 0.4em;
			margin-bottom: 0.125em;
			cursor: pointer;
			border-radius: 0.25em;
			display: flex;
			align-items: center;
			gap: 0.5em;

			&:hover {
				background: light-dark(#f0f0f0, #2a2a2a);
			}

			input {
				scale: 1.2;
				pointer-events: none;
			}

			span {
				font-size: 0.9rem;
			}
		}
	}

	.chip-input-box {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4em;
		padding: 0.4em;
		border-radius: 0.5em;
		box-shadow: var(--card);
		background: light-dark(white, black);

		&:hover {
			box-shadow: var(--neu-pressed);
		}

		ul {
			padding-left: 0;
			margin-block: 0;
			display: flex;
			flex-wrap: wrap;
			gap: 0.4em;
		}

		.chip-item {
			display: inline-flex;
			align-items: center;
			gap: 0.3em;
			font-size: 0.8rem;
			padding: 0.2em 0.6em;
			overflow-x: hidden;
			background-color: hsl(var(--hue, 10), 100%, 85%);
			color: hsl(var(--hue, 10), 100%, 50%);
			border-radius: 1em;

			button {
				padding: 0;
				width: 1.1em;
				height: 1.1em;

				svg {
					height: 1em;
					width: 1em;
				}
			}
		}

		input[type="text"] {
			padding: 0.2em;
			border: none;
			background: none;
			border-radius: 0.4em;
			min-width: 8em;
			flex: 1;

			&:focus {
				outline: none;
			}
		}
	}
</style>
