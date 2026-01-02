<script lang="ts">
	import KnowledgeBook from "./KnowledgeBook.svelte";
	import type { KnowledgeBook as BookType } from "./types/knowledge.js";

	interface Props {
		books: BookType[];
		searchQuery?: string;
		onBookUpdate?: (book: BookType) => void;
	}

	let { books, searchQuery = "", onBookUpdate = () => {} }: Props = $props();

	const filteredBooks = $derived(
		searchQuery.trim() === ""
			? books
			: books.filter((book) => book.title.toLowerCase().includes(searchQuery.toLowerCase()))
	);

	function handleToggleBook(bookId: string) {
		const book = books.find((b) => b.id === bookId);
		console.log(book);
		// book && onBookUpdate({ ...book, isActive: !book.isActive }); //FIXME BUG
	}

	function handleSectionUpdate(bookId: string, sections: any[]) {
		const book = books.find((b) => b.id === bookId);
		book && onBookUpdate({ ...book, sections });
	}
</script>

<knowledge-book-shelf>
	{#each filteredBooks as book (book.id)}
		<KnowledgeBook
			{book}
			onToggle={() => handleToggleBook(book.id)}
			onSectionUpdate={(sections) => handleSectionUpdate(book.id, sections)}
		/>
	{/each}
</knowledge-book-shelf>

<style>
	knowledge-book-shelf {
		display: flex;
		column-gap: 0.5em;
		animation: shelf-slide-in 400ms ease-out;
	}

	@keyframes shelf-slide-in {
		from {
			opacity: 0;
			transform: translateX(-1em);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}
</style>
