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
		transition: scale 200ms ease;

		&:hover {
			scale: 1.1;
		}

		&:active {
			scale: 0.9;
		}
	}
</style>
