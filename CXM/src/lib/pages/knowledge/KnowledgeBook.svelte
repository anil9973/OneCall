<script lang="ts">
	import BookSectionTree from "./BookSectionTree.svelte";
	import type { KnowledgeBook } from "./types/knowledge.js";

	interface Props {
		book: KnowledgeBook;
		onToggle?: () => void;
		onSectionUpdate?: (sections: any[]) => void;
	}

	let { book, onToggle = () => {}, onSectionUpdate = () => {} }: Props = $props();

	function handleToggle() {
		onToggle();
	}
</script>

<knowledge-book>
	<details name="knowledge-book" open={book.isActive} ontoggle={handleToggle}>
		<summary>
			<span class="status-light glow-green"></span>
			<span class="vertical-text">{book.title}</span>
			<span class="doc-count">{book.docCount} Docs</span>
		</summary>

		<BookSectionTree sections={book.sections} {onSectionUpdate} />
	</details>
</knowledge-book>

<style>
	knowledge-book details {
		margin: 0;
		height: 100%;
		border-radius: 0.5em;
		box-shadow: var(--card);
		background-color: light-dark(rgb(252, 233, 233), hsl(0, 0%, 10%));
		transition: translate 300ms ease;

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

		&:hover {
			translate: 0 2px;
		}

		summary {
			list-style-type: none;
			transition: background-color 200ms ease;
		}

		&:not([open]) summary {
			display: flex;
			align-items: center;
			justify-content: center;
			column-gap: 0.5em;
			padding: 1em 0.8em;
			height: 100%;
			writing-mode: vertical-rl;
			transform: scale(-1, -1);
			cursor: pointer;

			&:hover {
				background-color: light-dark(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.05));
			}

			span.vertical-text {
				font-weight: bold;
				font-size: 1.1rem;
			}

			span.doc-count {
				font-size: small;
				padding: 0.4em 0.2em;
				border-radius: 0.8em;
				box-shadow: var(--neu-pressed);
				background-color: light-dark(whitesmoke, hsl(0, 0%, 5%));
			}
		}

		&[open] {
			flex-grow: 1;

			summary {
				padding: 0.2em;
				border-radius: 0.5em 0.5em 0 0;
				text-align: center;
				box-shadow: var(--card);
				background-color: light-dark(whitesmoke, hsl(0, 0%, 15%));
				font-weight: 600;

				&:hover {
					background-color: light-dark(#e8e8e8, hsl(0, 0%, 18%));
				}
			}
		}
	}

	.status-light {
		display: inline-block;
		width: 0.5em;
		height: 0.5em;
		border-radius: 50%;

		&.glow-green {
			background-color: #10b981;
			box-shadow: 0 0 0.5em #10b981;
			animation: pulse-glow 2s ease-in-out infinite;
		}
	}
</style>
