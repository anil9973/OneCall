import type { Firestore } from "firebase-admin/firestore";
import type { EmbeddingService } from "./embedding.service.ts";
import type { SearchQuery, SearchResult, KnowledgeChunk, FAQ } from "../types/knowledge.ts";

export class VectorSearchService {
	private firestore: Firestore;
	private embeddingService: EmbeddingService;

	constructor(firestore: Firestore, embeddingService: EmbeddingService) {
		this.firestore = firestore;
		this.embeddingService = embeddingService;
	}

	async search(query: SearchQuery): Promise<SearchResult[]> {
		const queryEmbedding = await this.embeddingService.generateEmbedding(query.query);

		const [chunkResults, faqResults] = await Promise.all([
			this.searchChunks(query.domainId, queryEmbedding, query.limit || 5),
			this.searchFAQs(query.domainId, queryEmbedding, query.limit || 5),
		]);

		const allResults = [...chunkResults, ...faqResults];

		allResults.sort((a, b) => b.score - a.score);

		const threshold = query.threshold || 0.7;
		const filtered = allResults.filter((r) => r.score >= threshold);

		return filtered.slice(0, query.limit || 5);
	}

	private async searchChunks(domainId: string, queryEmbedding: number[], limit: number): Promise<SearchResult[]> {
		const snapshot = await this.firestore
			.collection("knowledge_bases")
			.doc(domainId)
			.collection("chunks")
			.limit(100)
			.get();

		const results: SearchResult[] = [];

		snapshot.docs.forEach((doc) => {
			const chunk = doc.data() as KnowledgeChunk;

			if (!chunk.embedding || chunk.embedding.length === 0) {
				return;
			}

			const score = this.embeddingService.cosineSimilarity(queryEmbedding, chunk.embedding);

			results.push({
				chunkId: doc.id,
				content: chunk.content,
				score,
				metadata: chunk.metadata,
				type: "chunk",
			});
		});

		results.sort((a, b) => b.score - a.score);

		return results.slice(0, limit);
	}

	private async searchFAQs(domainId: string, queryEmbedding: number[], limit: number): Promise<SearchResult[]> {
		const snapshot = await this.firestore
			.collection("knowledge_bases")
			.doc(domainId)
			.collection("faqs")
			.limit(50)
			.get();

		const results: SearchResult[] = [];

		snapshot.docs.forEach((doc) => {
			const faq = doc.data() as FAQ;

			if (!faq.embedding || faq.embedding.length === 0) {
				return;
			}

			const score = this.embeddingService.cosineSimilarity(queryEmbedding, faq.embedding);

			results.push({
				faqId: doc.id,
				content: `Q: ${faq.question}\nA: ${faq.answer}`,
				score,
				metadata: { question: faq.question, answer: faq.answer, category: faq.category },
				type: "faq",
			});
		});

		results.sort((a, b) => b.score - a.score);

		return results.slice(0, limit);
	}

	async addChunk(domainId: string, chunk: Omit<KnowledgeChunk, "id" | "domainId" | "createdAt">): Promise<string> {
		const chunkId = this.firestore.collection("_").doc().id;

		await this.firestore
			.collection("knowledge_bases")
			.doc(domainId)
			.collection("chunks")
			.doc(chunkId)
			.set({
				...chunk,
				domainId,
				createdAt: new Date(),
			});

		return chunkId;
	}

	async addFAQ(domainId: string, faq: Omit<FAQ, "id" | "domainId" | "createdAt" | "updatedAt">): Promise<string> {
		const faqId = this.firestore.collection("_").doc().id;

		await this.firestore
			.collection("knowledge_bases")
			.doc(domainId)
			.collection("faqs")
			.doc(faqId)
			.set({
				...faq,
				domainId,
				createdAt: new Date(),
				updatedAt: new Date(),
			});

		return faqId;
	}

	async deleteChunksByDocument(domainId: string, documentId: string): Promise<number> {
		const snapshot = await this.firestore
			.collection("knowledge_bases")
			.doc(domainId)
			.collection("chunks")
			.where("documentId", "==", documentId)
			.get();

		const batch = this.firestore.batch();

		snapshot.docs.forEach((doc) => {
			batch.delete(doc.ref);
		});

		await batch.commit();

		return snapshot.docs.length;
	}

	async deleteFAQ(domainId: string, faqId: string): Promise<void> {
		await this.firestore.collection("knowledge_bases").doc(domainId).collection("faqs").doc(faqId).delete();
	}
}
