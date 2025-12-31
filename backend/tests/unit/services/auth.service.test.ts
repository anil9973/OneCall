import { describe, it, expect, beforeEach } from "vitest";
import { AuthService } from "../../../src/services/auth.service";

describe("AuthService", () => {
	let authService: AuthService;

	beforeEach(() => {
		// Setup mock Firebase Auth and Firestore
		const mockAuth = {
			createUser: async () => ({ uid: "test_uid" }),
			verifyIdToken: async () => ({ uid: "test_uid", email: "test@example.com" }),
		};

		const mockFirestore = {
			collection: () => ({
				doc: () => ({
					set: async () => {},
					get: async () => ({ exists: true, data: () => ({}) }),
				}),
			}),
		};

		authService = new AuthService(mockAuth as any, mockFirestore as any);
	});

	describe("signup", () => {
		it("should create owner and return token", async () => {
			const result = await authService.signup({
				email: "test@example.com",
				password: "password123",
				name: "Test User",
			});

			expect(result.owner).toBeDefined();
			expect(result.owner.email).toBe("test@example.com");
		});

		it("should throw error for invalid email", async () => {
			await expect(
				authService.signup({
					email: "invalid",
					password: "password123",
					name: "Test",
				})
			).rejects.toThrow();
		});
	});
});
