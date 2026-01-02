<script lang="ts">
	import BookSectionBranch from "./BookSectionBranch.svelte";
	import type { KnowledgeSection } from "./types/knowledge.js";

	interface Props {
		sections: KnowledgeSection[];
		onSectionUpdate?: (sections: KnowledgeSection[]) => void;
	}

	let { sections, onSectionUpdate = () => {} }: Props = $props();

	function toggleSection(sectionId: string) {
		const updatedSections = sections.map((section) => {
			if (section.id === sectionId) {
				return { ...section, isExpanded: !section.isExpanded };
			}
			return section;
		});
		onSectionUpdate(updatedSections);
	}

	function handleChildUpdate(parentId: string, children: KnowledgeSection[]) {
		const updatedSections = sections.map((section) => {
			if (section.id === parentId) {
				return { ...section, children };
			}
			return section;
		});
		onSectionUpdate(updatedSections);
	}
</script>

<book-section-tree>
	<ul>
		{#each sections as section (section.id)}
			<BookSectionBranch {section} onToggle={toggleSection} onChildUpdate={handleChildUpdate} />
		{/each}
	</ul>
</book-section-tree>

<style>
	book-section-tree {
		--stem-clr: light-dark(hsl(0, 0%, 70%), hsl(0, 0%, 40%));
		display: block;
		padding-right: 0.5em;

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
