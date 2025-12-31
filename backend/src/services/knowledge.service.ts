import type { Firestore } from "firebase-admin/firestore";
import type { Bucket } from "@google-cloud/storage";
import type { KnowledgeDocument, DocumentType, ProcessingJob } from "../types/knowledge.js";
import { nanoid } from "nanoid";

export class KnowledgeService {
	private firestore: Firestore;
	private storageBucket: Bucket;

	constructor(firestore: Firestore, storageBucket: Bucket) {
		this.firestore = firestore;
		this.storageBucket = storageBucket;
	}

	async createDocument(
		domainId: string,
		title: string,
		type: DocumentType,
		file?: Buffer,
		metadata?: Record<string, unknown>
	): Promise<KnowledgeDocument> {
		const document: KnowledgeDocument = {
			id: nanoid(21),
			domainId,
			title,
			type,
			uploadedAt: Date.now(),
			status: "processing",
			chunkCount: 0,
			metadata: metadata || {},
		};

		if (file) {
			const filename = `knowledge/${domainId}/${document.id}`;
			const fileRef = this.storageBucket.file(filename);

			await fileRef.save(file, {
				metadata: {
					contentType: this.getContentType(type),
				},
			});

			const [url] = await fileRef.getSignedUrl({
				action: "read",
				expires: Date.now() + 1000 * 60 * 60 * 24 * 365,
			});

			document.fileUrl = url;
		}

		await this.firestore
			.collection("knowledge_bases")
			.doc(domainId)
			.collection("documents")
			.doc(document.id)
			.set({
				...document,
				uploadedAt: new Date(document.uploadedAt),
			});

		return document;
	}

	async getDocument(domainId: string, documentId: string): Promise<KnowledgeDocument | null> {
		const doc = await this.firestore
			.collection("knowledge_bases")
			.doc(domainId)
			.collection("documents")
			.doc(documentId)
			.get();

		if (!doc.exists) return null;

		const data = doc.data();
		if (!data) return null;

		return {
			id: doc.id,
			domainId: data.domainId,
			title: data.title,
			type: data.type,
			fileUrl: data.fileUrl,
			uploadedAt: data.uploadedAt.toMillis(),
			status: data.status,
			chunkCount: data.chunkCount,
			metadata: data.metadata,
			error: data.error,
		};
	}

	async listDocuments(domainId: string): Promise<KnowledgeDocument[]> {
		const snapshot = await this.firestore
			.collection("knowledge_bases")
			.doc(domainId)
			.collection("documents")
			.orderBy("uploadedAt", "desc")
			.get();

		return snapshot.docs.map((doc) => {
			const data = doc.data();
			return {
				id: doc.id,
				domainId: data.domainId,
				title: data.title,
				type: data.type,
				fileUrl: data.fileUrl,
				uploadedAt: data.uploadedAt.toMillis(),
				status: data.status,
				chunkCount: data.chunkCount,
				metadata: data.metadata,
				error: data.error,
			};
		});
	}

	async updateDocument(domainId: string, documentId: string, updates: Partial<KnowledgeDocument>): Promise<void> {
		const updateData: Record<string, unknown> = {};

		updates.status && (updateData.status = updates.status);
		updates.chunkCount !== undefined && (updateData.chunkCount = updates.chunkCount);
		updates.error && (updateData.error = updates.error);
		updates.metadata && (updateData.metadata = updates.metadata);

		await this.firestore
			.collection("knowledge_bases")
			.doc(domainId)
			.collection("documents")
			.doc(documentId)
			.update(updateData);
	}

	async deleteDocument(domainId: string, documentId: string): Promise<void> {
		const document = await this.getDocument(domainId, documentId);

		if (document?.fileUrl) {
			const filename = `knowledge/${domainId}/${documentId}`;
			await this.storageBucket
				.file(filename)
				.delete()
				.catch(() => {});
		}

		await this.firestore.collection("knowledge_bases").doc(domainId).collection("documents").doc(documentId).delete();
	}

	async createProcessingJob(documentId: string, domainId: string): Promise<ProcessingJob> {
		const job: ProcessingJob = {
			id: nanoid(21),
			documentId,
			domainId,
			status: "pending",
			progress: 0,
			createdAt: Date.now(),
		};

		await this.firestore
			.collection("processing_jobs")
			.doc(job.id)
			.set({
				...job,
				createdAt: new Date(job.createdAt),
			});

		return job;
	}

	async updateJob(jobId: string, updates: Partial<ProcessingJob>): Promise<void> {
		const updateData: Record<string, unknown> = {};

		updates.status && (updateData.status = updates.status);
		updates.progress !== undefined && (updateData.progress = updates.progress);
		updates.error && (updateData.error = updates.error);
		updates.startedAt && (updateData.startedAt = new Date(updates.startedAt));
		updates.completedAt && (updateData.completedAt = new Date(updates.completedAt));

		await this.firestore.collection("processing_jobs").doc(jobId).update(updateData);
	}

	async getJob(jobId: string): Promise<ProcessingJob | null> {
		const doc = await this.firestore.collection("processing_jobs").doc(jobId).get();

		if (!doc.exists) return null;

		const data = doc.data();
		if (!data) return null;

		return {
			id: doc.id,
			documentId: data.documentId,
			domainId: data.domainId,
			status: data.status,
			progress: data.progress,
			error: data.error,
			createdAt: data.createdAt.toMillis(),
			startedAt: data.startedAt?.toMillis(),
			completedAt: data.completedAt?.toMillis(),
		};
	}

	private getContentType(type: DocumentType): string {
		const types = {
			pdf: "application/pdf",
			txt: "text/plain",
			md: "text/markdown",
			docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			faq: "application/json",
			url: "text/plain",
			conversation: "application/json",
		};

		return types[type] || "application/octet-stream";
	}
}
