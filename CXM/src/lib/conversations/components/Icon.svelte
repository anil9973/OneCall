<!-- src/lib/components/Icon.svelte -->
<script lang="ts">
	interface Props {
		name: string;
		class?: string;
	}

	let { name, class: className = "" }: Props = $props();
</script>

<svg class="icon {className}">
	<use href="/icons.svg#{name}"></use>
</svg>

<style>
	svg.icon {
		fill: var(--icon-clr);
		height: 1.4em;
		width: 1.4em;
		vertical-align: middle;
		cursor: pointer;
		transition:
			fill 200ms ease,
			transform 200ms ease;

		&:hover {
			transform: scale(1.1);
		}

		&:active {
			transform: scale(0.95);
		}
	}
</style>
