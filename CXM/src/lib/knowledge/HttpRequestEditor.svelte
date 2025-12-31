<script lang="ts">
	import HttpKeyValueTable from "./HttpKeyValueTable.svelte";
	import TabularCarousel from "./TabularCarousel.svelte";
	import type { KeyValuePair } from "./types/knowledge.js";

	interface Props {
		headers?: KeyValuePair[];
		params?: KeyValuePair[];
		onHeadersChange?: (headers: KeyValuePair[]) => void;
		onParamsChange?: (params: KeyValuePair[]) => void;
	}

	let {
		headers = $bindable([]),
		params = $bindable([]),
		onHeadersChange = () => {},
		onParamsChange = () => {},
	}: Props = $props();

	function handleHeadersChange(updatedHeaders: KeyValuePair[]) {
		headers = updatedHeaders;
		onHeadersChange(headers);
	}

	function handleParamsChange(updatedParams: KeyValuePair[]) {
		params = updatedParams;
		onParamsChange(params);
	}
</script>

<TabularCarousel tabs={["Headers", "Params"]} onTabChange={(tab) => console.log("Tab:", tab)}>
	{#snippet headers_content()}
		<HttpKeyValueTable bind:items={headers} keyLabel="Key" valueLabel="Value" onChange={handleHeadersChange} />
	{/snippet}

	{#snippet params_content()}
		<HttpKeyValueTable bind:items={params} keyLabel="Param" valueLabel="Value" onChange={handleParamsChange} />
	{/snippet}
</TabularCarousel>

<style>
	/* Styles inherited from TabularCarousel */
</style>
