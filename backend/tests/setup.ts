import { beforeAll, afterAll } from "vitest";

beforeAll(async () => {
	process.env.NODE_ENV = "test";
	process.env.JWT_SECRET = "test-secret";
	process.env.FIREBASE_PROJECT_ID = "test-project";
});

afterAll(async () => {
	// Cleanup
});
