import { apiClient } from "../client.js";
import type { Owner } from "../types/backend-types.js";

interface SignupData {
	email: string;
	password: string;
	name: string;
	company?: string;
}

interface LoginData {
	email: string;
	password: string;
	firebaseToken: string;
}

interface AuthResponse {
	owner: Owner;
}

class AuthService {
	async signup(data: SignupData): Promise<Owner> {
		const response = await apiClient.post<AuthResponse>("/auth/signup", data);
		return response.owner;
	}

	async login(data: LoginData): Promise<Owner> {
		const response = await apiClient.post<AuthResponse>("/auth/login", data);
		return response.owner;
	}

	async logout(): Promise<void> {
		await apiClient.post("/auth/logout");
	}

	async getProfile(): Promise<Owner> {
		return apiClient.get<Owner>("/auth/me");
	}

	async updateProfile(data: { name?: string; company?: string }): Promise<Owner> {
		return apiClient.put<Owner>("/auth/profile", data);
	}

	async checkAuth(): Promise<Owner | null> {
		try {
			return await this.getProfile();
		} catch {
			return null;
		}
	}
}

export const authService = new AuthService();
