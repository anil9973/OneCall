import { writable, derived } from "svelte/store";
import { authService } from "../api/services/auth.service";
import type { Owner } from "../api/types/backend-types.js";

interface AuthState {
	user: Owner | null;
	loading: boolean;
	error: string | null;
}

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>({
		user: null,
		loading: false,
		error: null,
	});

	return {
		subscribe,

		async init() {
			update((state) => ({ ...state, loading: true }));

			try {
				const user = await authService.checkAuth();
				set({ user, loading: false, error: null });
			} catch {
				set({ user: null, loading: false, error: null });
			}
		},

		async signup(email: string, password: string, name: string, company?: string) {
			update((state) => ({ ...state, loading: true, error: null }));

			try {
				const user = await authService.signup({ email, password, name, company });
				set({ user, loading: false, error: null });
				return user;
			} catch (error) {
				const message = error instanceof Error ? error.message : "Signup failed";
				update((state) => ({ ...state, loading: false, error: message }));
				throw error;
			}
		},

		async login(email: string, password: string, firebaseToken: string) {
			update((state) => ({ ...state, loading: true, error: null }));

			try {
				const user = await authService.login({ email, password, firebaseToken });
				set({ user, loading: false, error: null });
				return user;
			} catch (error) {
				const message = error instanceof Error ? error.message : "Login failed";
				update((state) => ({ ...state, loading: false, error: message }));
				throw error;
			}
		},

		async logout() {
			try {
				await authService.logout();
			} finally {
				set({ user: null, loading: false, error: null });
			}
		},

		async updateProfile(name?: string, company?: string) {
			update((state) => ({ ...state, loading: true }));

			try {
				const user = await authService.updateProfile({ name, company });
				update((state) => ({ ...state, user, loading: false }));
				return user;
			} catch (error) {
				update((state) => ({ ...state, loading: false }));
				throw error;
			}
		},

		clearError() {
			update((state) => ({ ...state, error: null }));
		},
	};
}

export const authStore = createAuthStore();

export const isAuthenticated = derived(authStore, ($auth) => $auth.user !== null);

export const currentUser = derived(authStore, ($auth) => $auth.user);
