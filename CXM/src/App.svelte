<script>
	import ConversationPage from "./lib/conversations/components/ConversationPage.svelte";
	import Icon from "./lib/pages/components/Icon.svelte";
	import KnowledgePage from "./lib/knowledge/KnowledgePage.svelte";

	/* let route = $state(location.pathname);
	let CurrentPage = $derived.by(() => {
		switch (route) {
			case "/":
				return KnowledgePage;
			case "/conversations":
				return KnowledgePage;
			case "/knowledge":
				return ConversationPage;
			default: return NotFound;
		}
	});

	navigation.addEventListener("navigate", (event: NavigateEvent) => {
		event.intercept({
			handler: async () => (route = new URL(event.destination.url).pathname),
		});
	}); */
</script>

<main>
	<aside>
		<nav>
			<li title="Conversations">
				<Icon name="conversations" />
			</li>

			<li title="Knowledge Base">
				<Icon name="knowledge" />
			</li>

			<li title="Admin Settings">
				<Icon name="admin" />
			</li>
		</nav>
	</aside>

	<!-- <CurrentPage /> -->
	<!-- <ConversationPage /> -->
	<KnowledgePage />
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
