import { writable, derived } from "svelte/store";
import { domainService } from "../api/services/domain.service.js";
import type { Domain } from "../api/types/backend-types.js";

interface DomainState {
	list: Domain[];
	current: Domain | null;
	loading: boolean;
	error: string | null;
}

function createDomainStore() {
	const { subscribe, set, update } = writable<DomainState>({
		list: [],
		current: null,
		loading: false,
		error: null,
	});

	return {
		subscribe,

		async load() {
			update((state) => ({ ...state, loading: true, error: null }));

			try {
				const domains = await domainService.list();
				update((state) => ({
					...state,
					list: domains,
					current: state.current || domains[0] || null,
					loading: false,
				}));
			} catch (error) {
				const message = error instanceof Error ? error.message : "Failed to load domains";
				update((state) => ({ ...state, loading: false, error: message }));
			}
		},

		async add(domain: string) {
			update((state) => ({ ...state, loading: true, error: null }));

			try {
				const result = await domainService.add(domain);
				await this.load();
				return result;
			} catch (error) {
				const message = error instanceof Error ? error.message : "Failed to add domain";
				update((state) => ({ ...state, loading: false, error: message }));
				throw error;
			}
		},

		async verify(domainId: string, method: "dns" | "html_meta" | "file_upload") {
			try {
				const result = await domainService.verify(domainId, method);
				await this.load();
				return result;
			} catch (error) {
				const message = error instanceof Error ? error.message : "Verification failed";
				update((state) => ({ ...state, error: message }));
				throw error;
			}
		},

		async updateSettings(domainId: string, settings: Partial<Domain["settings"]>) {
			try {
				await domainService.updateSettings(domainId, settings);
				await this.load();
			} catch (error) {
				const message = error instanceof Error ? error.message : "Failed to update settings";
				update((state) => ({ ...state, error: message }));
				throw error;
			}
		},

		async delete(domainId: string) {
			try {
				await domainService.delete(domainId);
				update((state) => ({
					...state,
					list: state.list.filter((d) => d.id !== domainId),
					current: state.current?.id === domainId ? state.list[0] || null : state.current,
				}));
			} catch (error) {
				const message = error instanceof Error ? error.message : "Failed to delete domain";
				update((state) => ({ ...state, error: message }));
				throw error;
			}
		},

		setCurrent(domain: Domain) {
			update((state) => ({ ...state, current: domain }));
		},

		clearError() {
			update((state) => ({ ...state, error: null }));
		},
	};
}

export const domainStore = createDomainStore();

export const currentDomain = derived(domainStore, ($store) => $store.current);

export const verifiedDomains = derived(domainStore, ($store) => $store.list.filter((d) => d.verified));
