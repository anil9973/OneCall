import { apiClient } from "../client.js";
import type { KnowledgeDocument, SearchResult } from "../types/backend-types.js";

class KnowledgeService {
	async listDocuments(domainId: string): Promise<KnowledgeDocument[]> {
		const response = await apiClient.get<{ documents: KnowledgeDocument[] }>(`/knowledge/${domainId}`);
		return response.documents;
	}

	async getDocument(domainId: string, docId: string): Promise<KnowledgeDocument> {
		return apiClient.get<KnowledgeDocument>(`/knowledge/${domainId}/${docId}`);
	}

	async uploadDocument(domainId: string, file: File): Promise<{ id: string; jobId: string }> {
		return apiClient.uploadFile(`/knowledge/${domainId}/upload`, file);
	}

	async addFAQ(
		domainId: string,
		data: {
			question: string;
			answer: string;
			category?: string;
		}
	): Promise<{ id: string }> {
		return apiClient.post(`/knowledge/${domainId}/faq`, data);
	}

	async scrapeURL(
		domainId: string,
		data: {
			url: string;
			title: string;
		}
	): Promise<{ id: string; jobId: string }> {
		return apiClient.post(`/knowledge/${domainId}/scrape`, data);
	}

	async deleteDocument(domainId: string, docId: string): Promise<void> {
		await apiClient.delete(`/knowledge/${domainId}/${docId}`);
	}

	async search(domainId: string, query: string, limit?: number, threshold?: number): Promise<SearchResult[]> {
		const response = await apiClient.post<{ results: SearchResult[] }>(`/knowledge/${domainId}/search`, {
			query,
			limit,
			threshold,
		});
		return response.results;
	}

	async getJobStatus(jobId: string): Promise<{
		id: string;
		status: string;
		progress: number;
		error?: string;
	}> {
		return apiClient.get(`/knowledge/jobs/${jobId}`);
	}
}

export const knowledgeService = new KnowledgeService();
