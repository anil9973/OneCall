import { describe, it, expect } from "vitest";

describe("Call Flow E2E", () => {
	const baseUrl = "http://localhost:3000";

	it("should complete full call flow", async () => {
		const startResponse = await fetch(`${baseUrl}/calls/start`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				domain: "test.com",
				userId: "user_123",
				pageUrl: "https://test.com/product",
			}),
		});

		expect(startResponse.status).toBe(200);
		const { sessionId, token } = await startResponse.json();
		expect(sessionId).toBeDefined();

		const conversationResponse = await fetch(`${baseUrl}/conversations/start`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				sessionId,
				domain: "test.com",
				userId: "user_123",
			}),
		});

		expect(conversationResponse.status).toBe(200);
		const { id: conversationId } = await conversationResponse.json();

		const messageResponse = await fetch(`${baseUrl}/conversations/${conversationId}/message`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				role: "user",
				content: "Hello, I need help",
				timestamp: Date.now(),
			}),
		});

		expect(messageResponse.status).toBe(200);

		const endResponse = await fetch(`${baseUrl}/calls/end`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				sessionId,
				reason: "completed",
				duration: 60,
			}),
		});

		expect(endResponse.status).toBe(200);
	});
});
