import type { FastifyInstance } from "fastify";
import { AuthHandlers } from "./handlers.ts";
import * as schema from "./schema.ts";

export async function authRoutes(fastify: FastifyInstance) {
	const handlers = new AuthHandlers(fastify.authService);

	fastify.post("/signup", { schema: schema.signupSchema }, handlers.signup);
	fastify.post("/login", { schema: schema.loginSchema }, handlers.login);
	fastify.post("/refresh", { schema: schema.refreshTokenSchema }, handlers.refreshToken);
	fastify.get("/me", { schema: schema.getMeSchema, onRequest: [fastify.authenticateOwner] }, handlers.getMe);
	fastify.put(
		"/profile",
		{ schema: schema.updateProfileSchema, onRequest: [fastify.authenticateOwner] },
		handlers.updateProfile
	);
}
