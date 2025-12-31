<script lang="ts">
	import Icon from "../conversations/components/Icon.svelte";

	import type { KnowledgeSection } from "./types/knowledge.js";

	interface Props {
		section: KnowledgeSection;
		onToggle?: (sectionId: string) => void;
		onChildUpdate?: (sectionId: string, children: KnowledgeSection[]) => void;
	}

	let { section, onToggle = () => {}, onChildUpdate = () => {} }: Props = $props();

	function handleToggle() {
		onToggle(section.id);
	}

	function handleChildrenUpdate(children: KnowledgeSection[]) {
		onChildUpdate(section.id, children);
	}
</script>

<li>
	<button class="toggle-btn" onclick={handleToggle} title={section.isExpanded ? "Collapse" : "Expand"}>
		<Icon name={section.isExpanded ? "minus-box" : "plus-box"} />
	</button>

	<div class="section-card">
		<div class="num-coin">
			<div class="coin-inner">
				<span class="coin-number">{section.number}</span>
			</div>
		</div>

		<p class="summary">{section.summary}</p>
	</div>

	{#if section.isExpanded && section.children && section.children.length > 0}
		<ul>
			{#each section.children as child (child.id)}
				<svelte:self section={child} {onToggle} onChildUpdate={handleChildrenUpdate} />
			{/each}
		</ul>
	{/if}
</li>

<style>
	li {
		list-style-type: none;
		margin-block: 0.5em;
		position: relative;

		&::before {
			content: " ";
			position: absolute;
			height: 0.125em;
			width: calc(2em - 0.4em);
			background-color: var(--stem-clr);
			top: 0.8em;
			left: calc(0.4em - 2em);
			z-index: -1;
			transition: background-color 200ms ease;
		}

		&:hover::before {
			background-color: light-dark(#ef4444, #f87171);
		}
	}

	.toggle-btn {
		position: absolute;
		left: calc(-1.1 * 2em);
		padding: 0;
		top: 0.2em;
		background: none;
		border: none;
		cursor: pointer;
		transition: transform 200ms ease;

		&:hover {
			transform: scale(1.2);
		}

		&:active {
			transform: scale(0.9);
		}

		:global(svg) {
			height: 1.1em;
		}
	}

	.section-card {
		padding: 0.5em;
		border-radius: 0.5em;
		box-shadow: var(--card);
		background-image: radial-gradient(circle 0.75em at 0 50%, transparent 1em, light-dark(white, hsl(0, 0%, 10%)) 0);
		transition:
			translate 200ms ease-out,
			opacity 200ms ease-out,
			box-shadow 200ms ease;
		position: relative;

		p {
			margin-left: 2ch;
			margin-block: 0;
			font-size: 0.9rem;
			line-height: 1.5;
		}

		&:hover {
			translate: 0 -0.125em;
			opacity: 0.95;
			box-shadow: 0 0.25em 0.5em light-dark(rgba(0, 0, 0, 0.15), rgba(200, 200, 200, 0.25));
		}

		&:active {
			translate: 0 0;
		}
	}

	.num-coin {
		--size: 2em;
		--ring-width: 0.25em;
		position: absolute;
		left: -0.9em;
		inset-block: 0;
		margin-block: auto;
		border-radius: 50%;
		height: var(--size);
		inline-size: var(--size);
		box-shadow: var(--card);
		padding: var(--ring-width);
		background-color: light-dark(hsl(0, 0%, 100%), rgb(60, 60, 60));
		transition: transform 200ms ease;

		.coin-inner {
			border-radius: 50%;
			height: calc(var(--size) - var(--ring-width) * 2);
			inline-size: calc(var(--size) - var(--ring-width) * 2);
			box-shadow: var(--neu-pressed);
			padding: 0.2em;
			display: flex;
			justify-content: center;
			align-items: center;
		}

		.coin-number {
			color: light-dark(#ef4444, #f87171);
			font-size: 0.9rem;
			font-weight: bold;
			text-shadow: 0.0625em 0.0625em 0.0625em var(--coin-shadow);
			text-align: center;
		}
	}

	.section-card:hover .num-coin {
		transform: rotate(360deg);
	}

	ul {
		--pd-left: 2em;
		--vrt-stem-left: 0.4em;
		padding-left: var(--pd-left);
		margin-block: 0;
		position: relative;
		isolation: isolate;
		animation: nested-open 500ms ease-out;

		&::before {
			content: " ";
			position: absolute;
			height: 100%;
			width: 0.125em;
			background-color: var(--stem-clr);
			left: 0.4em;
			top: -0.4em;
			transition: background-color 200ms ease;
		}

		&:hover::before {
			background-color: light-dark(#ef4444, #f87171);
		}
	}

	@keyframes nested-open {
		from {
			opacity: 0;
			max-height: 0;
		}
		to {
			opacity: 1;
			max-height: 100vh;
		}
	}
</style>
