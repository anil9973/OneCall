import { apiClient } from "../client.js";
import type { Domain } from "../types/backend-types.js";

class DomainService {
	async list(): Promise<Domain[]> {
		const response = await apiClient.get<{ domains: Domain[] }>("/domains");
		return response.domains;
	}

	async get(domainId: string): Promise<Domain> {
		return apiClient.get<Domain>(`/domains/${domainId}`);
	}

	async add(domain: string): Promise<{
		id: string;
		verificationCode: string;
		instructions: {
			dns: string;
			html_meta: string;
			file_upload: string;
		};
	}> {
		return apiClient.post("/domains", { domain });
	}

	async verify(
		domainId: string,
		method: "dns" | "html_meta" | "file_upload"
	): Promise<{
		success: boolean;
		verified: boolean;
	}> {
		return apiClient.post(`/domains/${domainId}/verify`, { method });
	}

	async updateSettings(
		domainId: string,
		settings: {
			allowEscalation?: boolean;
			workingHours?: {
				timezone: string;
				days: Record<string, { open: string; close: string }>;
			};
			voiceId?: string;
			autoEscalateKeywords?: string[];
			maxAIDuration?: number;
		}
	): Promise<void> {
		await apiClient.put(`/domains/${domainId}`, settings);
	}

	async delete(domainId: string): Promise<void> {
		await apiClient.delete(`/domains/${domainId}`);
	}

	async regenerateCode(domainId: string): Promise<{
		verificationCode: string;
		instructions: {
			dns: string;
			html_meta: string;
			file_upload: string;
		};
	}> {
		return apiClient.post(`/domains/${domainId}/regenerate-code`);
	}
}

export const domainService = new DomainService();
