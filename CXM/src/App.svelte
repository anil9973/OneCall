<script>
	import ConversationApp from "./lib/conversations/components/ConversationPage.svelte";
	import KnowledgeApp from "./lib/knowledge/KnowledgePage.svelte";
</script>

<main>
	<aside>
		<nav>
			<li title="Conversations">
				<svg class="icon">
					<use href="/public/icons.svg#conversations"></use>
				</svg>
			</li>
			<li title="Knowledge Base">
				<svg class="icon">
					<use href="/public/icons.svg#knowledge"></use>
				</svg>
			</li>
			<li title="Admin Settings">
				<svg class="icon">
					<use href="/public/icons.svg#admin"></use>
				</svg>
			</li>
		</nav>
	</aside>
	<!-- <KnowledgeApp /> -->
	<ConversationApp />
</main>

<style>
	main {
		display: flex;
		height: 100vh;
		overflow: hidden;
	}

	aside {
		height: 100vh;
		width: 48px;

		nav {
			height: 100%;
			display: flex;
			flex-direction: column;
			padding: 0.5em 0;

			li {
				display: flex;
				align-items: center;
				justify-content: center;
				padding: 0.5em;
				cursor: pointer;
				transition:
					background 200ms ease,
					transform 200ms ease;

				&:hover {
					background: light-dark(hsl(0, 0%, 90%), hsl(0, 0%, 15%));
					transform: scale(1.1);
				}

				&:active {
					transform: scale(0.95);
				}

				&:last-child {
					margin-top: auto;
				}

				:global(svg) {
					height: 1.5em;
					width: 1.5em;
				}
			}
		}

		& + * {
			flex-grow: 1;
		}
	}
</style>
