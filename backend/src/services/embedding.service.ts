export class EmbeddingService {
	private apiKey: string;
	private apiUrl = "https://api.openai.com/v1/embeddings";
	private model = "text-embedding-3-small";

	constructor(apiKey: string) {
		this.apiKey = apiKey;
	}

	async generateEmbedding(text: string): Promise<number[]> {
		const response = await fetch(this.apiUrl, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${this.apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				input: text,
				model: this.model,
			}),
		});

		if (!response.ok) {
			throw new Error(`Embedding API error: ${response.statusText}`);
		}

		const data = await response.json();
		return data.data[0].embedding;
	}

	async generateEmbeddings(texts: string[]): Promise<number[][]> {
		const batchSize = 100;
		const results: number[][] = [];

		for (let i = 0; i < texts.length; i += batchSize) {
			const batch = texts.slice(i, i + batchSize);

			const response = await fetch(this.apiUrl, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${this.apiKey}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					input: batch,
					model: this.model,
				}),
			});

			if (!response.ok) {
				throw new Error(`Embedding API error: ${response.statusText}`);
			}

			const data = await response.json();
			results.push(...data.data.map((d: any) => d.embedding));
		}

		return results;
	}

	cosineSimilarity(a: number[], b: number[]): number {
		if (a.length !== b.length) {
			throw new Error("Vectors must have same length");
		}

		let dotProduct = 0;
		let normA = 0;
		let normB = 0;

		for (let i = 0; i < a.length; i++) {
			dotProduct += a[i] * b[i];
			normA += a[i] * a[i];
			normB += b[i] * b[i];
		}

		return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
	}
}
