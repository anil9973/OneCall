<script lang="ts">
	import KnowledgeBookShelf from "./KnowledgeBookShelf.svelte";
	import KnowledgeUploadArea from "./KnowledgeUploadArea.svelte";
	import type { KnowledgeBook } from "./types/knowledge.js";

	interface Props {
		books: KnowledgeBook[];
		searchQuery?: string;
		onBookUpdate?: (book: KnowledgeBook) => void;
		onUploadFiles?: (files: File[]) => void;
	}

	let { books, searchQuery = "", onBookUpdate = () => {}, onUploadFiles = () => {} }: Props = $props();

	const hasOpenBook = $derived(books.some((book) => book.isActive));
</script>

<knowledge-body-container>
	<knowledge-shelf-viewport>
		<KnowledgeBookShelf {books} {searchQuery} {onBookUpdate} />

		{#if !hasOpenBook}
			<KnowledgeUploadArea {onUploadFiles} />
		{/if}
	</knowledge-shelf-viewport>
</knowledge-body-container>

<style>
	knowledge-body-container {
		display: block;
		height: 93vh;
		padding: 0.5em;
		border-radius: 0 1em 1em 1em;
		box-shadow: var(--card);
		background-color: light-dark(white, black);
		animation: fade-in 300ms ease-out;
	}

	knowledge-shelf-viewport {
		display: flex;
		height: 100%;
		gap: 0.5em;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(-0.5em);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
