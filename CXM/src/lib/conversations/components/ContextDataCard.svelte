<script lang="ts">
	interface Props {
		orderId: string;
		amount: string;
		date: string;
	}

	let { orderId, amount, date }: Props = $props();
</script>

<context-data-card>
	<table>
		<caption>Context & Data</caption>
		<tbody>
			<tr>
				<td class="key"><span>Order ID</span></td>
				<td align="right"><span>{orderId}</span></td>
			</tr>
			<tr>
				<td class="key"><span>Amount</span></td>
				<td align="right"><span>{amount}</span></td>
			</tr>
			<tr>
				<td class="key"><span>Date</span></td>
				<td align="right"><span>{date}</span></td>
			</tr>
		</tbody>
	</table>

	<div class="view-link">
		<a href="#order-details" title="View full order details"> View Order Details → </a>
	</div>
</context-data-card>

<style>
	context-data-card {
		display: flex;
		flex-direction: column;
		gap: 0.5em;
		transition: translate 200ms ease-out;

		&:hover {
			translate: 0 -2px;
		}

		table {
			width: 100%;
			border-radius: 0.5em;
			border-collapse: collapse;
			background-color: light-dark(white, black);
			box-shadow: var(--card);

			caption {
				font-size: 0.9rem;
				font-weight: 600;
				padding: 0.5em;
				text-align: left;
			}

			tr:not(:last-child) {
				border-bottom: 0.0625em solid light-dark(hsl(0, 1%, 85%), hsl(0, 1%, 28%));
			}

			td {
				padding: 0.4em;
				font-size: 0.9rem;

				&.key {
					color: light-dark(#666, #999);
				}
			}
		}

		.view-link {
			width: fit-content;
			margin: 0 auto;
			border-radius: 1em;
			box-shadow: var(--card);

			a {
				display: inline-block;
				border-radius: 1em;
				padding: 0.4em 0.8em;
				box-shadow: var(--neu-pressed);
				background-color: light-dark(white, black);
				text-decoration: none;
				font-size: 0.85rem;
				color: light-dark(#3b82f6, #60a5fa);
				transition: all 200ms ease;

				&:hover {
					box-shadow: var(--neu-flat);
				}
			}
		}
	}
</style>
