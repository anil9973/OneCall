import { writable, derived } from "svelte/store";
import { conversationService } from "../api/services/conversation.service";
import {
	toConversationList,
	toMessageList,
	extractSystemEvents,
	extractTimelineSegments,
} from "../api/adapters/conversation-adapter";
import type { BackendConversation, ConversationSummary, ConversationFilter } from "../api/types/backend-types";
import type { Conversation, Message, SystemEvent, TimelineSegment } from "../../../types/conversations.js";

interface ConversationState {
	list: Conversation[];
	selected: BackendConversation | null;
	loading: boolean;
	error: string | null;
	filters: ConversationFilter;
}

function createConversationStore() {
	const { subscribe, set, update } = writable<ConversationState>({
		list: [],
		selected: null,
		loading: false,
		error: null,
		filters: {
			limit: 50,
			offset: 0,
		},
	});

	return {
		subscribe,

		async load(filters?: ConversationFilter) {
			update((state) => ({ ...state, loading: true, error: null, filters: filters || state.filters }));

			try {
				const summaries = await conversationService.list(filters);
				const conversations = toConversationList(summaries);
				update((state) => ({ ...state, list: conversations, loading: false }));
			} catch (error) {
				const message = error instanceof Error ? error.message : "Failed to load conversations";
				update((state) => ({ ...state, loading: false, error: message }));
			}
		},

		async loadMore() {
			update((state) => {
				const newFilters = {
					...state.filters,
					offset: (state.filters.offset || 0) + (state.filters.limit || 50),
				};
				return { ...state, filters: newFilters };
			});

			let currentFilters: ConversationFilter = {};
			subscribe((state) => {
				currentFilters = state.filters;
			})();

			try {
				const summaries = await conversationService.list(currentFilters);
				const newConversations = toConversationList(summaries);
				update((state) => ({ ...state, list: [...state.list, ...newConversations] }));
			} catch (error) {
				const message = error instanceof Error ? error.message : "Failed to load more";
				update((state) => ({ ...state, error: message }));
			}
		},

		async select(id: string) {
			update((state) => ({ ...state, loading: true, error: null }));

			try {
				const conversation = await conversationService.get(id);
				update((state) => ({ ...state, selected: conversation, loading: false }));
			} catch (error) {
				const message = error instanceof Error ? error.message : "Failed to load conversation";
				update((state) => ({ ...state, loading: false, error: message }));
			}
		},

		async search(query: string, domain?: string) {
			update((state) => ({ ...state, loading: true, error: null }));

			try {
				const summaries = await conversationService.search(query, domain, 20);
				const conversations = toConversationList(summaries);
				update((state) => ({ ...state, list: conversations, loading: false }));
			} catch (error) {
				const message = error instanceof Error ? error.message : "Search failed";
				update((state) => ({ ...state, loading: false, error: message }));
			}
		},

		async refresh() {
			let currentFilters: ConversationFilter = {};
			subscribe((state) => {
				currentFilters = state.filters;
			})();
			await this.load(currentFilters);
		},

		setFilters(filters: ConversationFilter) {
			update((state) => ({ ...state, filters: { ...state.filters, ...filters } }));
		},

		clearError() {
			update((state) => ({ ...state, error: null }));
		},

		clearSelected() {
			update((state) => ({ ...state, selected: null }));
		},
	};
}

export const conversationStore = createConversationStore();

export const selectedMessages = derived(conversationStore, ($store) =>
	$store.selected ? toMessageList($store.selected.messages) : []
);

export const selectedEvents = derived(conversationStore, ($store) =>
	$store.selected ? extractSystemEvents($store.selected) : []
);

export const selectedTimeline = derived(conversationStore, ($store) =>
	$store.selected ? extractTimelineSegments($store.selected) : []
);
