const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

interface RequestOptions extends RequestInit {
	params?: Record<string, string | number | boolean>;
}

class ApiClient {
	private baseUrl: string;

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl;
	}

	private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
		const { params, ...fetchOptions } = options;

		let url = `${this.baseUrl}${endpoint}`;

		if (params) {
			const queryString = new URLSearchParams(
				Object.entries(params).map(([key, value]) => [key, String(value)])
			).toString();
			url = `${url}?${queryString}`;
		}

		const headers = new Headers({
			"Content-Type": "application/json",
			...fetchOptions.headers,
		});

		const response = await fetch(url, {
			...fetchOptions,
			credentials: "include",
			headers,
		});

		if (!response.ok) {
			const error = await response.json().catch(() => ({ error: response.statusText }));
			throw new Error(error.error || error.message || "Request failed");
		}

		return response.json();
	}

	async get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<T> {
		return this.request<T>(endpoint, { method: "GET", params });
	}

	async post<T>(endpoint: string, data?: unknown): Promise<T> {
		return this.request<T>(endpoint, {
			method: "POST",
			body: data ? JSON.stringify(data) : undefined,
		});
	}

	async put<T>(endpoint: string, data?: unknown): Promise<T> {
		return this.request<T>(endpoint, {
			method: "PUT",
			body: data ? JSON.stringify(data) : undefined,
		});
	}

	async delete<T>(endpoint: string): Promise<T> {
		return this.request<T>(endpoint, { method: "DELETE" });
	}

	async uploadFile<T>(endpoint: string, file: File): Promise<T> {
		const formData = new FormData();
		formData.append("file", file);

		const response = await fetch(`${this.baseUrl}${endpoint}`, {
			method: "POST",
			credentials: "include",
			body: formData,
		});

		if (!response.ok) {
			const error = await response.json().catch(() => ({ error: response.statusText }));
			throw new Error(error.error || "Upload failed");
		}

		return response.json();
	}
}

export const apiClient = new ApiClient(API_BASE_URL);
