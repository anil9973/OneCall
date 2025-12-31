import type { KnowledgeService } from "./knowledge.service.ts";
import type { EmbeddingService } from "./embedding.service.ts";
import type { VectorSearchService } from "./vector-search.service.ts";
import type { DocumentType } from "../types/knowledge.ts";

export class DocumentProcessorService {
	private knowledgeService: KnowledgeService;
	private embeddingService: EmbeddingService;
	private vectorSearchService: VectorSearchService;

	constructor(
		knowledgeService: KnowledgeService,
		embeddingService: EmbeddingService,
		vectorSearchService: VectorSearchService
	) {
		this.knowledgeService = knowledgeService;
		this.embeddingService = embeddingService;
		this.vectorSearchService = vectorSearchService;
	}

	async processDocument(domainId: string, documentId: string): Promise<void> {
		const document = await this.knowledgeService.getDocument(domainId, documentId);

		if (!document) {
			throw new Error("Document not found");
		}

		const job = await this.knowledgeService.createProcessingJob(documentId, domainId);

		try {
			await this.knowledgeService.updateJob(job.id, {
				status: "processing",
				startedAt: Date.now(),
			});

			let text = "";

			switch (document.type) {
				case "pdf":
					text = await this.extractPDF(document.fileUrl!);
					break;
				case "txt":
				case "md":
					text = await this.extractText(document.fileUrl!);
					break;
				case "url":
					text = await this.scrapeURL(document.metadata?.url as string);
					break;
				default:
					throw new Error(`Unsupported document type: ${document.type}`);
			}

			const chunks = this.chunkText(text, 1000, 200);

			await this.knowledgeService.updateJob(job.id, { progress: 50 });

			const embeddings = await this.embeddingService.generateEmbeddings(chunks);

			for (let i = 0; i < chunks.length; i++) {
				await this.vectorSearchService.addChunk(domainId, {
					documentId: document.id,
					content: chunks[i],
					embedding: embeddings[i],
					metadata: {
						page: Math.floor(i / 2) + 1,
						title: document.title,
					},
				});
			}

			await this.knowledgeService.updateDocument(domainId, documentId, {
				status: "ready",
				chunkCount: chunks.length,
			});

			await this.knowledgeService.updateJob(job.id, {
				status: "completed",
				progress: 100,
				completedAt: Date.now(),
			});
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Unknown error";

			await this.knowledgeService.updateDocument(domainId, documentId, {
				status: "failed",
				error: errorMessage,
			});

			await this.knowledgeService.updateJob(job.id, {
				status: "failed",
				error: errorMessage,
			});

			throw error;
		}
	}

	private async extractPDF(url: string): Promise<string> {
		const { PDFParse } = await import("pdf-parse");
		const response = await fetch(url);
		const buffer = await response.arrayBuffer();
		const parser = await new PDFParse(Buffer.from(buffer));
		const result = await parser.getText();
		return result.text;
	}

	private async extractText(url: string): Promise<string> {
		const response = await fetch(url);
		return response.text();
	}

	private async scrapeURL(url: string): Promise<string> {
		const response = await fetch(url, {
			headers: {
				"User-Agent": "OneCall-Bot/1.0",
			},
		});

		const html = await response.text();

		const text = html
			.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
			.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
			.replace(/<[^>]+>/g, " ")
			.replace(/\s+/g, " ")
			.trim();

		return text;
	}

	private chunkText(text: string, chunkSize: number, overlap: number): string[] {
		const chunks: string[] = [];
		const sentences = text.split(/[.!?]+\s+/);

		let currentChunk = "";

		for (const sentence of sentences) {
			const trimmed = sentence.trim();
			if (!trimmed) continue;

			if ((currentChunk + trimmed).length > chunkSize && currentChunk) {
				chunks.push(currentChunk.trim());

				const words = currentChunk.split(" ");
				const overlapWords = words.slice(-Math.floor(overlap / 5));
				currentChunk = overlapWords.join(" ") + " " + trimmed;
			} else {
				currentChunk += (currentChunk ? " " : "") + trimmed;
			}
		}

		currentChunk.trim() && chunks.push(currentChunk.trim());

		return chunks;
	}

	async processFAQ(domainId: string, question: string, answer: string, category?: string): Promise<string> {
		const embedding = await this.embeddingService.generateEmbedding(`${question} ${answer}`);

		return this.vectorSearchService.addFAQ(domainId, {
			question,
			answer,
			embedding,
			category,
		});
	}
}
