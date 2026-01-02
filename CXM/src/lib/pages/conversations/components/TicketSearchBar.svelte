<script lang="ts">
	interface Props {
		statusFilter: string;
		searchQuery?: string;
	}

	let { statusFilter = "", searchQuery = "" }: Props = $props();
</script>

<ticket-list-header>
	<support-ticket-search-card>
		<search>
			<select bind:value={statusFilter}>
				<option value="all">All Status</option>
				<option value="new">New</option>
				<option value="pending">Pending</option>
				<option value="escalated">Escalated</option>
				<option value="resolved">Resolved</option>
			</select>
			<input type="text" placeholder="🔎 search" bind:value={searchQuery} />
		</search>
	</support-ticket-search-card>
</ticket-list-header>

<style>
	support-ticket-search-card {
		display: block;
		margin: 0.5em 1em;
		border-radius: 1em;
		box-shadow: var(--card);

		search {
			display: flex;
			border-radius: 1em;
			padding: 0.3125em;
			box-shadow: var(--neu-pressed);
			background: light-dark(white, black);
		}

		select {
			border: none;
			background: none;
			cursor: pointer;
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
