import type { HttpTool, KnowledgeBook } from "../../pages/knowledge/types/knowledge.js";
import type { KnowledgeDocument, Tool } from "../types/backend-types";

export function toKnowledgeBook(doc: KnowledgeDocument): KnowledgeBook {
	return {
		id: doc.id,
		title: doc.title,
		description: `${doc.chunkCount} chunks • ${doc.type.toUpperCase()}`,
		status: doc.status === "ready" ? "indexed" : doc.status,
		lastUpdated: new Date(doc.uploadedAt).toLocaleDateString(),
		sections: [],
		metadata: {
			pages: doc.metadata?.pages || 0,
			size: doc.metadata?.size || 0,
			type: doc.type,
		},
	};
}

export function toKnowledgeBookList(docs: KnowledgeDocument[]): KnowledgeBook[] {
	return docs.map(toKnowledgeBook);
}

export function toHttpTool(tool: Tool): HttpTool {
	const config = tool.config as any;

	return {
		id: tool.id,
		name: tool.name,
		description: tool.description,
		enabled: tool.enabled,
		method: config.method || "GET",
		url: config.url || "",
		headers: config.headers || {},
		body: config.body || "",
		authentication: {
			type: config.authType || "none",
			token: config.authValue || "",
		},
		response: {
			statusCode: 0,
			body: "",
			headers: {},
		},
		lastTested: new Date(tool.updatedAt).toISOString(),
	};
}

export function toHttpToolList(tools: Tool[]): HttpTool[] {
	return tools.filter((t) => t.type === "http").map(toHttpTool);
}
