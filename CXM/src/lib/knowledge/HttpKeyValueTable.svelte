<script lang="ts">
	import Icon from "../conversations/components/Icon.svelte";
	import type { KeyValuePair } from "./types/knowledge.js";

	interface Props {
		items?: KeyValuePair[];
		keyLabel?: string;
		valueLabel?: string;
		onChange?: (items: KeyValuePair[]) => void;
	}

	let {
		items = $bindable([{ id: crypto.randomUUID(), key: "", value: "" }]),
		keyLabel = "Key",
		valueLabel = "Value",
		onChange = () => {},
	}: Props = $props();

	function ensureEmptyRow() {
		const hasEmptyRow = items.some((item) => item.key === "" && item.value === "");
		if (!hasEmptyRow) {
			items = [...items, { id: crypto.randomUUID(), key: "", value: "" }];
			onChange(items);
		}
	}

	function removeEmptyRows() {
		const filledItems = items.filter((item) => item.key !== "" || item.value !== "");
		if (filledItems.length === 0) {
			items = [{ id: crypto.randomUUID(), key: "", value: "" }];
		} else {
			items = filledItems;
		}
		ensureEmptyRow();
		onChange(items);
	}

	function handleKeyInput(id: string, value: string) {
		items = items.map((item) => (item.id === id ? { ...item, key: value } : item));
		ensureEmptyRow();
		onChange(items);
	}

	function handleValueInput(id: string, value: string) {
		items = items.map((item) => (item.id === id ? { ...item, value: value } : item));
		onChange(items);
	}

	function handleKeyBlur() {
		removeEmptyRows();
	}

	function removeRow(id: string) {
		items = items.filter((item) => item.id !== id);
		if (items.length === 0) {
			items = [{ id: crypto.randomUUID(), key: "", value: "" }];
		}
		onChange(items);
	}

	$effect(() => {
		if (items.length === 0) {
			items = [{ id: crypto.randomUUID(), key: "", value: "" }];
		}
	});
</script>

<table>
	<thead>
		<tr>
			<th>{keyLabel}</th>
			<th>{valueLabel}</th>
			<th></th>
		</tr>
	</thead>
	<tbody>
		{#each items as item (item.id)}
			<tr>
				<td>
					<input
						type="text"
						value={item.key}
						oninput={(e) => handleKeyInput(item.id, e.currentTarget.value)}
						onblur={handleKeyBlur}
					/>
				</td>
				<td>
					<input type="text" value={item.value} oninput={(e) => handleValueInput(item.id, e.currentTarget.value)} />
				</td>
				<td>
					{#if item.key !== "" || item.value !== ""}
						<button class="delete-btn" onclick={() => removeRow(item.id)} title="Remove row">
							<Icon name="delete" />
						</button>
					{/if}
				</td>
			</tr>
		{/each}
	</tbody>
</table>

<style>
	table {
		width: 100%;
		border-collapse: collapse;

		th {
			padding-block: 0.4em;
			text-align: left;
			font-size: 0.85rem;
			color: light-dark(#666, #999);
		}

		td,
		th {
			border: 0.0625em solid light-dark(hsl(0, 1%, 85%), hsl(0, 1%, 28%));
			padding: 0.3em;
		}

		input[type="text"] {
			width: 100%;
			border: none;
			padding: 0.4em;
			background: none;
			transition: background 200ms ease;

			&:focus {
				outline: none;
				background: light-dark(#f9fafb, rgba(255, 255, 255, 0.05));
			}
		}

		tr {
			transition: background 200ms ease;

			&:hover {
				background: light-dark(#fafafa, rgba(255, 255, 255, 0.02));
			}
		}

		.delete-btn {
			opacity: 0;
			padding: 0.2em;
			background: none;
			border: none;
			cursor: pointer;
			transition:
				opacity 200ms ease,
				transform 200ms ease;

			:global(svg) {
				fill: light-dark(#ef4444, #f87171);
			}

			&:hover {
				transform: scale(1.2);
			}

			&:active {
				transform: scale(0.9);
			}
		}

		tr:hover .delete-btn {
			opacity: 1;
		}
	}
</style>
