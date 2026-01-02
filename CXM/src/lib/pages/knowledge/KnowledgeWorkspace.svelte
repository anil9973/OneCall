<script lang="ts">
	import KnowledgeTabBar from "./KnowledgeTabBar.svelte";
	import KnowledgeBodyContainer from "./KnowledgeBodyContainer.svelte";
	import ToolsetContainer from "./ToolsetContainer.svelte";
	import type { TabType, KnowledgeBook, HttpTool } from "./types/knowledge.js";

	interface Props {
		books?: KnowledgeBook[];
		tools?: HttpTool[];
		onBookUpdate?: (book: KnowledgeBook) => void;
		onToolUpdate?: (tool: HttpTool) => void;
		onUploadFiles?: (files: File[]) => void;
	}

	let {
		books = [],
		tools = [],
		onBookUpdate = () => {},
		onToolUpdate = () => {},
		onUploadFiles = () => {},
	}: Props = $props();

	let activeTab = $state<TabType>("knowledge");
	let searchQuery = $state("");

	function handleTabChange(tab: TabType) {
		activeTab = tab;
	}
</script>

<knowledge-base-workspace>
	<KnowledgeTabBar
		{activeTab}
		{searchQuery}
		onTabChange={handleTabChange}
		onSearchChange={(query) => (searchQuery = query)}
	/>

	{#if activeTab === "knowledge"}
		<KnowledgeBodyContainer {books} {searchQuery} {onBookUpdate} {onUploadFiles} />
	{:else if activeTab === "tools"}
		<ToolsetContainer {tools} {onToolUpdate} />
	{:else if activeTab === "webhook"}
		<div class="placeholder">Webhook configuration coming soon...</div>
	{:else if activeTab === "mcp"}
		<div class="placeholder">MCP Server configuration coming soon...</div>
	{/if}
</knowledge-base-workspace>

<style>
	knowledge-base-workspace {
		flex-grow: 1;
		padding: 0.5em;
		height: 100%;

		.placeholder {
			display: flex;
			align-items: center;
			justify-content: center;
			height: 90vh;
			padding: 2em;
			border-radius: 1em;
			box-shadow: var(--card);
			background-color: light-dark(white, black);
			color: light-dark(#999, #666);
			font-size: 1.2rem;
		}
	}
</style>
