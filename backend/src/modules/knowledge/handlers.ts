import type { FastifyRequest, FastifyReply } from "fastify";
import type { KnowledgeService } from "../../services/knowledge.service.ts";
import type { DocumentProcessorService } from "../../services/document-processor.service.ts";
import type { VectorSearchService } from "../../services/vector-search.service.ts";
import type { DomainVerificationService } from "../../services/domain-verification.service.ts";

export class KnowledgeHandlers {
	private knowledgeService: KnowledgeService;
	private processorService: DocumentProcessorService;
	private searchService: VectorSearchService;
	private domainService: DomainVerificationService;

	constructor(
		knowledgeService: KnowledgeService,
		processorService: DocumentProcessorService,
		searchService: VectorSearchService,
		domainService: DomainVerificationService
	) {
		this.knowledgeService = knowledgeService;
		this.processorService = processorService;
		this.searchService = searchService;
		this.domainService = domainService;
	}

	async uploadDocument(request: FastifyRequest<{ Params: { domainId: string } }>, reply: FastifyReply) {
		const ownerId = request.owner?.id;
		const { domainId } = request.params;
		if (!ownerId) return reply.code(401).send({ error: "Unauthorized" });

		const hasAccess = await this.verifyDomainAccess(ownerId, domainId);
		if (!hasAccess) return reply.code(403).send({ error: "Access denied" });

		const data = await request.file();
		if (!data) return reply.code(400).send({ error: "No file uploaded" });

		const buffer = await data.toBuffer();
		const filename = data.filename;
		const type = this.getDocumentType(filename);

		const document = await this.knowledgeService.createDocument(domainId, filename, type, buffer, {
			size: buffer.length,
		});

		this.processorService
			.processDocument(domainId, document.id)
			.catch((error) => console.error("Processing error:", error));

		const job = await this.knowledgeService.createProcessingJob(document.id, domainId);

		return {
			id: document.id,
			title: document.title,
			status: document.status,
			jobId: job.id,
		};
	}

	async addFAQ(
		request: FastifyRequest<{
			Params: { domainId: string };
			Body: { question: string; answer: string; category?: string };
		}>,
		reply: FastifyReply
	) {
		const ownerId = request.owner?.id;
		const { domainId } = request.params;
		const { question, answer, category } = request.body;

		if (!ownerId) return reply.code(401).send({ error: "Unauthorized" });

		const hasAccess = await this.verifyDomainAccess(ownerId, domainId);
		if (!hasAccess) return reply.code(403).send({ error: "Access denied" });

		const faqId = await this.processorService.processFAQ(domainId, question, answer, category);

		return {
			id: faqId,
			question,
			answer,
			category,
		};
	}

	async scrapeURL(
		request: FastifyRequest<{
			Params: { domainId: string };
			Body: { url: string; title: string };
		}>,
		reply: FastifyReply
	) {
		const ownerId = request.owner?.id;
		const { domainId } = request.params;
		const { url, title } = request.body;

		if (!ownerId) return reply.code(401).send({ error: "Unauthorized" });

		const hasAccess = await this.verifyDomainAccess(ownerId, domainId);
		if (!hasAccess) return reply.code(403).send({ error: "Access denied" });

		const document = await this.knowledgeService.createDocument(domainId, title, "url", undefined, { url });

		this.processorService
			.processDocument(domainId, document.id)
			.catch((error) => console.error("Processing error:", error));

		const job = await this.knowledgeService.createProcessingJob(document.id, domainId);

		return {
			id: document.id,
			title: document.title,
			jobId: job.id,
		};
	}

	async listDocuments(request: FastifyRequest<{ Params: { domainId: string } }>, reply: FastifyReply) {
		const ownerId = request.owner?.id;
		const { domainId } = request.params;

		if (!ownerId) return reply.code(401).send({ error: "Unauthorized" });

		const hasAccess = await this.verifyDomainAccess(ownerId, domainId);
		if (!hasAccess) return reply.code(403).send({ error: "Access denied" });

		const documents = await this.knowledgeService.listDocuments(domainId);

		return { documents };
	}

	async getDocument(request: FastifyRequest<{ Params: { domainId: string; docId: string } }>, reply: FastifyReply) {
		const ownerId = request.owner?.id;
		const { domainId, docId } = request.params;

		if (!ownerId) return reply.code(401).send({ error: "Unauthorized" });

		const hasAccess = await this.verifyDomainAccess(ownerId, domainId);
		if (!hasAccess) return reply.code(403).send({ error: "Access denied" });

		const document = await this.knowledgeService.getDocument(domainId, docId);
		if (!document) return reply.code(404).send({ error: "Document not found" });

		return document;
	}

	async deleteDocument(
		request: FastifyRequest<{ Params: { domainId: string; docId: string } }>,
		reply: FastifyReply
	) {
		const ownerId = request.owner?.id;
		const { domainId, docId } = request.params;

		if (!ownerId) return reply.code(401).send({ error: "Unauthorized" });

		const hasAccess = await this.verifyDomainAccess(ownerId, domainId);
		if (!hasAccess) return reply.code(403).send({ error: "Access denied" });

		await this.searchService.deleteChunksByDocument(domainId, docId);
		await this.knowledgeService.deleteDocument(domainId, docId);

		return { success: true };
	}

	async searchKnowledge(
		request: FastifyRequest<{
			Params: { domainId: string };
			Body: { query: string; limit?: number; threshold?: number };
		}>,
		reply: FastifyReply
	) {
		const { domainId } = request.params;
		const { query, limit, threshold } = request.body;

		const results = await this.searchService.search({
			query,
			domainId,
			limit,
			threshold,
		});

		return { results };
	}

	async getJobStatus(request: FastifyRequest<{ Params: { jobId: string } }>, reply: FastifyReply) {
		const { jobId } = request.params;

		const job = await this.knowledgeService.getJob(jobId);
		if (!job) return reply.code(404).send({ error: "Job not found" });

		return {
			id: job.id,
			status: job.status,
			progress: job.progress,
			error: job.error,
		};
	}

	private async verifyDomainAccess(ownerId: string, domainId: string): Promise<boolean> {
		const domain = await this.domainService.getDomain(domainId);
		return domain?.ownerId === ownerId && domain?.verified === true;
	}

	private getDocumentType(filename: string): "pdf" | "txt" | "md" | "docx" {
		const ext = filename.split(".").pop()?.toLowerCase();

		if (ext === "pdf") return "pdf";
		if (ext === "txt") return "txt";
		if (ext === "md") return "md";
		if (ext === "docx") return "docx";

		return "txt";
	}
}
