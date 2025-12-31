export type TabType = "knowledge" | "tools" | "webhook" | "mcp";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface KnowledgeBook {
	id: string;
	title: string;
	docCount: number;
	isActive: boolean;
	sections: KnowledgeSection[];
}

export interface KnowledgeSection {
	id: string;
	number: string;
	summary: string;
	fullText?: string;
	children?: KnowledgeSection[];
	isExpanded?: boolean;
}

export interface HttpTool {
	id: string;
	name: string;
	description: string;
	method: HttpMethod;
	url: string;
	headers: KeyValuePair[];
	params: KeyValuePair[];
	responseSchema?: string;
	responseBody?: string;
}

export interface KeyValuePair {
	id: string;
	key: string;
	value: string;
}

export interface Webhook {
	id: string;
	name: string;
	description: string;
	url: string;
	headers: KeyValuePair[];
	events: string[];
}
