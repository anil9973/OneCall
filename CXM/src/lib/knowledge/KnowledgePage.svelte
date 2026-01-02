<script lang="ts">
	import KnowledgeWorkspace from "./KnowledgeWorkspace.svelte";
	import { MOCK_KNOWLEDGE_BOOKS, MOCK_HTTP_TOOLS } from "../../data/mock-data-knowledge.js";
	import type { KnowledgeBook, HttpTool } from "./types/knowledge.js";

	let books = $state<KnowledgeBook[]>(MOCK_KNOWLEDGE_BOOKS);
	let tools = $state<HttpTool[]>(MOCK_HTTP_TOOLS);

	function handleBookUpdate(updatedBook: KnowledgeBook) {
		books = books.map((b) => (b.id === updatedBook.id ? updatedBook : b));
	}

	function handleToolUpdate(updatedTool: HttpTool) {
		tools = tools.map((t) => (t.id === updatedTool.id ? updatedTool : t));
		console.log("Tool updated:", updatedTool);
	}

	function handleUploadFiles(files: File[]) {
		console.log("Files uploaded:", files);
	}
</script>

<KnowledgeWorkspace
	{books}
	{tools}
	onBookUpdate={handleBookUpdate}
	onToolUpdate={handleToolUpdate}
	onUploadFiles={handleUploadFiles}
/>
