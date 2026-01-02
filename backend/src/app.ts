import Fastify from "fastify";

// Plugins
import envPlugin from "./plugins/env.ts";
import authPlugin from "./plugins/auth.ts";
import corsPlugin from "./plugins/cors.ts";
// import rateLimitPlugin from "./plugins/rate-limit.ts";

// Modules
import { conversationRoutes } from "./modules/conversation/routes.ts";
import { toolsRoutes } from "./modules/tools/routes.ts";
import { voicesRoutes } from "./modules/voices/routes.ts";

export async function buildApp() {
	const fastify = Fastify({
		logger: {
			level: process.env.NODE_ENV === "production" ? "info" : "debug",
		},
	});

	// Register plugins
	await fastify.register(envPlugin);
	// await fastify.register(authPlugin);
	await fastify.register(corsPlugin);
	// await fastify.register(rateLimitPlugin);

	// Health check
	/* fastify.get("/health", async () => ({ status: "ok" }));
	fastify.setErrorHandler((error, request, reply) => {
		if (error instanceof AppError) {
			return reply.status(error.statusCode).send({
				error: error.code,
				message: error.message,
			});
		}

		if (error.validation) {
			return reply.status(400).send({
				error: "VALIDATION_ERROR",
				message: "Request validation failed",
				details: error.validation,
			});
		}

		fastify.log.error(error);
		return reply.status(500).send({
			error: "INTERNAL_ERROR",
			message: config.nodeEnv === "development" ? error.message : "Internal server error",
		});
	}); */

	// Register modules
	await fastify.register(conversationRoutes, { prefix: "/api/conversation" });
	// await fastify.register(toolsRoutes, { prefix: "/api/tools" });
	// await fastify.register(voicesRoutes, { prefix: "/api/voices" });
	return fastify;
}
