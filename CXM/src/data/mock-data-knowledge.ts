import type { KnowledgeBook, HttpTool, KeyValuePair } from "../lib/pages/knowledge/types/knowledge.js";

export const MOCK_KNOWLEDGE_BOOKS: KnowledgeBook[] = [
	{
		id: "book-1",
		title: "REFUNDS",
		docCount: 12,
		isActive: true,
		sections: [
			{
				id: "section-1.1",
				number: "1.1",
				summary:
					"Returns accepted within 30 days if items are unused. Lorem, ipsum dolor sit amet consectetur adipisicing elit. Nemo, molestias consequuntur quo, vel quisquam quam neque nobis voluptates temporibus aperiam laudantium nihil deserunt similique! Facilis ipsum delectus perferendis nisi dolorum.",
				fullText:
					"# Return Policy\n\nReturns accepted within 30 days if items are unused.\n\n## Details\n- Items must be in original packaging\n- Receipt or proof of purchase required\n- Refund processed within 5-7 business days",
				isExpanded: true,
				children: [
					{
						id: "section-1.1.1",
						number: "1.1.1",
						summary: "Exceptions for damaged items. Full refund available immediately.",
						fullText: "# Damaged Items Policy\n\nImmediate full refunds for damaged items.",
						isExpanded: false,
					},
				],
			},
			{
				id: "section-1.2",
				number: "1.2",
				summary: "Refund processing time: 5-7 business days after receiving returned item.",
				fullText: "# Refund Processing\n\nTypical processing time is 5-7 business days.",
				isExpanded: false,
			},
		],
	},
	{
		id: "book-2",
		title: "SHIPPING",
		docCount: 8,
		isActive: false,
		sections: [],
	},
	{
		id: "book-3",
		title: "PAYMENTS",
		docCount: 15,
		isActive: false,
		sections: [],
	},
];

export const MOCK_HTTP_TOOLS: HttpTool[] = [
	{
		id: "tool-1",
		name: "Get Order Details",
		description: "Fetch order information from the e-commerce API",
		method: "GET",
		url: "https://api.example.com/orders/{orderId}",
		headers: [
			{ id: "h1", key: "Authorization", value: "Bearer {token}" },
			{ id: "h2", key: "Content-Type", value: "application/json" },
		],
		params: [{ id: "p1", key: "include", value: "items,customer" }],
		responseSchema: '{\n  "orderId": "string",\n  "status": "string",\n  "total": "number"\n}',
	},
];

export const MOCK_KEY_VALUE_PAIR: KeyValuePair = {
	id: "",
	key: "",
	value: "",
};
