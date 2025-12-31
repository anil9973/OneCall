<script lang="ts">
	import { getSegmentHeight } from "../utils/helpers.js";
	import type { TimelineSegment } from "../types/conversations.js";

	interface Props {
		segments?: TimelineSegment[];
	}

	let { segments = [] }: Props = $props();
</script>

<vertical-timeline-bar>
	{#each segments as segment, index (segment.time)}
		<timeline-spot-dot
			data-type={segment.type}
			data-time={segment.time}
			style="top: {getSegmentHeight(index, segments)}%"
			title={segment.label || segment.time}
		>
		</timeline-spot-dot>
	{/each}
</vertical-timeline-bar>

<style>
	vertical-timeline-bar {
		height: 100%;
		width: 0.25em;
		background-color: light-dark(#ccc, #555);
		position: relative;
		flex-shrink: 0;

		timeline-spot-dot {
			position: absolute;
			height: 0.9em;
			width: 0.7em;
			margin-left: -0.2em;
			border-radius: 50%;
			background-color: light-dark(#999, #666);
			transition: background-color 200ms ease;

			&[data-type="start"] {
				background-color: light-dark(#10b981, #059669);
			}

			&[data-type="ai-handling"] {
				background-color: light-dark(#3b82f6, #2563eb);
			}

			&[data-type="issue"] {
				background-color: light-dark(#f59e0b, #d97706);
			}

			&[data-type="escalation"] {
				background-color: light-dark(#ef4444, #dc2626);
			}

			&[data-type="current"] {
				background-color: light-dark(#8b5cf6, #7c3aed);
				animation: pulse-opacity 2s ease-in-out infinite;
			}
		}
	}
</style>
