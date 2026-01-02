import { writable } from "svelte/store";
import { toolService } from "../api/services/tool.service";
import { knowledgeService } from "../api/services/knowledge.service";
import { toKnowledgeBookList, toHttpToolList } from "../api/adapters/knowledge-adapter";
import type { KnowledgeDocument, Tool, SearchResult } from "../api/types/backend-types";
import type { HttpTool, KnowledgeBook } from "../pages/knowledge/types/knowledge.js";

interface KnowledgeState {
	documents: KnowledgeBook[];
	tools: HttpTool[];
	searchResults: SearchResult[];
	loading: boolean;
	uploadProgress: number;
	error: string | null;
	currentDomain: string | null;
}

function createKnowledgeStore() {
	const { subscribe, set, update } = writable<KnowledgeState>({
		documents: [],
		tools: [],
		searchResults: [],
		loading: false,
		uploadProgress: 0,
		error: null,
		currentDomain: null,
	});

	return {
		subscribe,

		setDomain(domainId: string) {
			update((state) => ({ ...state, currentDomain: domainId }));
		},

		async loadDocuments(domainId?: string) {
			let domain = domainId;

			if (!domain) {
				subscribe((state) => {
					domain = state.currentDomain || undefined;
				})();
			}

			if (!domain) {
				update((state) => ({ ...state, error: "No domain selected" }));
				return;
			}

			update((state) => ({ ...state, loading: true, error: null }));

			try {
				const docs = await knowledgeService.listDocuments(domain);
				const books = toKnowledgeBookList(docs);
				update((state) => ({ ...state, documents: books, loading: false }));
			} catch (error) {
				const message = error instanceof Error ? error.message : "Failed to load documents";
				update((state) => ({ ...state, loading: false, error: message }));
			}
		},

		async loadTools(domainId?: string) {
			let domain = domainId;

			if (!domain) {
				subscribe((state) => {
					domain = state.currentDomain || undefined;
				})();
			}

			if (!domain) return;

			update((state) => ({ ...state, loading: true, error: null }));

			try {
				const tools = await toolService.list(domain);
				const httpTools = toHttpToolList(tools);
				update((state) => ({ ...state, tools: httpTools, loading: false }));
			} catch (error) {
				const message = error instanceof Error ? error.message : "Failed to load tools";
				update((state) => ({ ...state, loading: false, error: message }));
			}
		},

		async uploadDocument(file: File, domainId?: string) {
			let domain = domainId;

			if (!domain) {
				subscribe((state) => {
					domain = state.currentDomain || undefined;
				})();
			}

			if (!domain) {
				update((state) => ({ ...state, error: "No domain selected" }));
				return;
			}

			update((state) => ({ ...state, loading: true, uploadProgress: 0, error: null }));

			try {
				const result = await knowledgeService.uploadDocument(domain, file);

				update((state) => ({ ...state, uploadProgress: 100 }));

				setTimeout(() => {
					update((state) => ({ ...state, uploadProgress: 0, loading: false }));
					this.loadDocuments(domain);
				}, 1000);

				return result;
			} catch (error) {
				const message = error instanceof Error ? error.message : "Upload failed";
				update((state) => ({ ...state, loading: false, uploadProgress: 0, error: message }));
				throw error;
			}
		},

		async addFAQ(question: string, answer: string, category?: string, domainId?: string) {
			let domain = domainId;

			if (!domain) {
				subscribe((state) => {
					domain = state.currentDomain || undefined;
				})();
			}

			if (!domain) return;

			try {
				await knowledgeService.addFAQ(domain, { question, answer, category });
				await this.loadDocuments(domain);
			} catch (error) {
				const message = error instanceof Error ? error.message : "Failed to add FAQ";
				update((state) => ({ ...state, error: message }));
				throw error;
			}
		},

		async deleteDocument(docId: string, domainId?: string) {
			let domain = domainId;

			if (!domain) {
				subscribe((state) => {
					domain = state.currentDomain || undefined;
				})();
			}

			if (!domain) return;

			try {
				await knowledgeService.deleteDocument(domain, docId);
				update((state) => ({
					...state,
					documents: state.documents.filter((d) => d.id !== docId),
				}));
			} catch (error) {
				const message = error instanceof Error ? error.message : "Failed to delete document";
				update((state) => ({ ...state, error: message }));
				throw error;
			}
		},

		async search(query: string, domainId?: string) {
			let domain = domainId;

			if (!domain) {
				subscribe((state) => {
					domain = state.currentDomain || undefined;
				})();
			}

			if (!domain) return;

			update((state) => ({ ...state, loading: true }));

			try {
				const results = await knowledgeService.search(domain, query, 10);
				update((state) => ({ ...state, searchResults: results, loading: false }));
			} catch (error) {
				const message = error instanceof Error ? error.message : "Search failed";
				update((state) => ({ ...state, loading: false, error: message }));
			}
		},

		async createTool(tool: Partial<HttpTool>, domainId?: string) {
			let domain = domainId;

			if (!domain) {
				subscribe((state) => {
					domain = state.currentDomain || undefined;
				})();
			}

			if (!domain) return;

			try {
				await toolService.create(domain, {
					name: tool.name || "",
					description: tool.description || "",
					type: "http",
					enabled: tool.enabled !== false,
					config: {
						method: tool.method,
						url: tool.url,
						headers: tool.headers,
						authType: tool.authentication?.type,
						authValue: tool.authentication?.token,
					},
				});
				await this.loadTools(domain);
			} catch (error) {
				const message = error instanceof Error ? error.message : "Failed to create tool";
				update((state) => ({ ...state, error: message }));
				throw error;
			}
		},

		async updateTool(toolId: string, updates: Partial<HttpTool>, domainId?: string) {
			let domain = domainId;

			if (!domain) {
				subscribe((state) => {
					domain = state.currentDomain || undefined;
				})();
			}

			if (!domain) return;

			try {
				await toolService.update(domain, toolId, updates as any);
				await this.loadTools(domain);
			} catch (error) {
				const message = error instanceof Error ? error.message : "Failed to update tool";
				update((state) => ({ ...state, error: message }));
				throw error;
			}
		},

		async deleteTool(toolId: string, domainId?: string) {
			let domain = domainId;

			if (!domain) {
				subscribe((state) => {
					domain = state.currentDomain || undefined;
				})();
			}

			if (!domain) return;

			try {
				await toolService.delete(domain, toolId);
				update((state) => ({
					...state,
					tools: state.tools.filter((t) => t.id !== toolId),
				}));
			} catch (error) {
				const message = error instanceof Error ? error.message : "Failed to delete tool";
				update((state) => ({ ...state, error: message }));
				throw error;
			}
		},

		clearError() {
			update((state) => ({ ...state, error: null }));
		},
	};
}

export const knowledgeStore = createKnowledgeStore();
