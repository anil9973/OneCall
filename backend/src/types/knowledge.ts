export type DocumentType = "pdf" | "txt" | "md" | "docx" | "faq" | "url" | "conversation";

export type DocumentStatus = "processing" | "ready" | "failed";

export interface KnowledgeDocument {
	id: string;
	domainId: string;
	title: string;
	type: DocumentType;
	fileUrl?: string;
	uploadedAt: number;
	status: DocumentStatus;
	chunkCount: number;
	metadata?: {
		size?: number;
		pages?: number;
		author?: string;
		url?: string;
		[key: string]: unknown;
	};
	error?: string;
}

export interface KnowledgeChunk {
	id: string;
	domainId: string;
	documentId: string;
	content: string;
	embedding: number[];
	metadata: {
		page?: number;
		section?: string;
		title?: string;
		[key: string]: unknown;
	};
	createdAt: number;
}

export interface FAQ {
	id: string;
	domainId: string;
	question: string;
	answer: string;
	embedding: number[];
	category?: string;
	createdAt: number;
	updatedAt: number;
}

export interface SearchQuery {
	query: string;
	domainId: string;
	limit?: number;
	threshold?: number;
}

export interface SearchResult {
	chunkId?: string;
	faqId?: string;
	content: string;
	score: number;
	metadata?: Record<string, unknown>;
	type: "chunk" | "faq";
}

export interface ProcessingJob {
	id: string;
	documentId: string;
	domainId: string;
	status: "pending" | "processing" | "completed" | "failed";
	progress: number;
	error?: string;
	createdAt: number;
	startedAt?: number;
	completedAt?: number;
}
