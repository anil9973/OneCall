<script lang="ts">
	import Icon from "../components/Icon.svelte";

	interface Props {
		onUploadFiles?: (files: File[]) => void;
	}

	let { onUploadFiles = () => {} }: Props = $props();

	let isDragging = $state(false);
	let fileInput: HTMLInputElement;

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}

	function handleDragLeave() {
		isDragging = false;
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;

		const files = Array.from(e.dataTransfer?.files || []);
		if (files.length > 0) {
			onUploadFiles(files);
		}
	}

	function handleClick() {
		fileInput?.click();
	}

	function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		const files = Array.from(target.files || []);
		if (files.length > 0) {
			onUploadFiles(files);
		}
	}
</script>

<knowledge-upload-area
	class:dragging={isDragging}
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	ondrop={handleDrop}
	onclick={handleClick}
	role="button"
	tabindex="0"
>
	<input
		bind:this={fileInput}
		type="file"
		multiple
		hidden
		onchange={handleFileSelect}
		accept=".pdf,.txt,.md,.doc,.docx"
	/>

	<Icon name="upload" />
	<div>Drop and drop here or Browse documents</div>
</knowledge-upload-area>

<style>
	knowledge-upload-area {
		flex-grow: 1;
		height: 96%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1em;
		margin: 1em;
		border: 0.125em dashed light-dark(#ccc, #555);
		border-radius: 1em;
		cursor: pointer;
		transition: all 200ms ease;

		&:hover {
			border-color: light-dark(#3b82f6, #60a5fa);
			background-color: light-dark(rgba(59, 130, 246, 0.05), rgba(59, 130, 246, 0.1));
			transform: scale(1.01);
		}

		&:active {
			transform: scale(0.99);
		}

		&.dragging {
			border-color: light-dark(#10b981, #34d399);
			background-color: light-dark(rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.2));
			border-style: solid;
		}

		:global(svg.icon) {
			width: 3em;
			height: 3em;
			fill: light-dark(#999, #666);
			transition:
				fill 200ms ease,
				transform 200ms ease;
		}

		&:hover :global(svg.icon) {
			fill: light-dark(#3b82f6, #60a5fa);
			transform: translateY(-0.25em);
		}

		&.dragging :global(svg.icon) {
			fill: light-dark(#10b981, #34d399);
			animation: bounce 600ms ease-in-out infinite;
		}

		div {
			font-size: 1.1rem;
			color: light-dark(#666, #999);
			transition: color 200ms ease;
		}

		&:hover div {
			color: light-dark(#3b82f6, #60a5fa);
		}

		&.dragging div {
			color: light-dark(#10b981, #34d399);
		}
	}

	@keyframes bounce {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-0.5em);
		}
	}
</style>
