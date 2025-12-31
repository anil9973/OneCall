<script lang="ts">
	import Icon from "../conversations/components/Icon.svelte";
	import type { TabType } from "./types/knowledge.js";

	interface Props {
		activeTab: TabType;
		searchQuery: string;
		onTabChange?: (tab: TabType) => void;
		onSearchChange?: (query: string) => void;
	}

	let { activeTab, searchQuery = $bindable(""), onTabChange = () => {}, onSearchChange = () => {} }: Props = $props();

	const tabs: Array<{ id: TabType; label: string; icon: string }> = [
		{ id: "knowledge", label: "Knowledge", icon: "knowledge" },
		{ id: "tools", label: "Tools", icon: "tools" },
		{ id: "webhook", label: "Webhook", icon: "webhook" },
		{ id: "mcp", label: "MCP Server", icon: "mcp" },
	];

	function handleTabClick(tabId: TabType) {
		onTabChange(tabId);
	}

	function handleSearchInput(e: Event) {
		const target = e.target as HTMLInputElement;
		searchQuery = target.value;
		onSearchChange(target.value);
	}
</script>

<knowledge-tabs-search-bar>
	<knowledge-tab-list>
		{#each tabs as tab}
			<li
				class:active={activeTab === tab.id}
				onclick={() => handleTabClick(tab.id)}
				role="tab"
				tabindex="0"
				aria-selected={activeTab === tab.id}
			>
				<Icon name={tab.icon} />
				<span>{tab.label}</span>
			</li>
		{/each}
	</knowledge-tab-list>

	<knowledge-search-field>
		<search>
			<input type="text" placeholder="Search" value={searchQuery} oninput={handleSearchInput} />
		</search>
	</knowledge-search-field>
</knowledge-tabs-search-bar>

<style>
	knowledge-tabs-search-bar {
		display: flex;
		gap: 1em;
	}

	knowledge-tab-list {
		display: flex;
		align-items: center;
		margin-bottom: -0.375em;
		gap: 0.25em;

		li {
			display: flex;
			align-items: center;
			gap: 0.5em;
			padding: 0.5em 1em;
			border-top-left-radius: 1em;
			border-top-right-radius: 1em;
			background-color: light-dark(#ccc, #555);
			position: relative;
			isolation: isolate;
			cursor: pointer;
			transition:
				background-color 200ms ease,
				transform 200ms ease;

			&:hover {
				background-color: light-dark(#ddd, #666);
				transform: translateY(-0.125em);
			}

			&:active {
				transform: translateY(0);
			}

			&.active {
				background-color: light-dark(white, black);
				box-shadow: var(--card);
			}

			span {
				font-size: 0.9rem;
				font-weight: 500;
			}
		}
	}

	knowledge-search-field {
		margin-inline: auto;
		margin-bottom: 0.25em;
		flex-grow: 0.4;
		padding: 0.4em;
		border-radius: 1em;
		box-shadow: var(--card);
		background-color: light-dark(white, black);
		transition: box-shadow 200ms ease;

		&:focus-within {
			box-shadow: 0 0.25em 0.5em light-dark(rgba(0, 0, 0, 0.15), rgba(200, 200, 200, 0.25));
		}

		search {
			--block-sdw-clr: light-dark(160 160 160, 60 60 60);
			border-radius: 1em;
			background-color: light-dark(white, black);
			box-shadow:
				inset -0.1875em 0.1875em 0.1875em 0 rgb(var(--block-sdw-clr) / 0.5),
				inset 0.1875em -0.1875em 0.1875em 0 rgb(var(--block-sdw-clr) / 0.5);
		}

		input {
			border: none;
			border-radius: 1em;
			padding: 0.5em;
			background: none;
			width: 100%;

			&:focus {
				outline: none;
			}
		}
	}
</style>
