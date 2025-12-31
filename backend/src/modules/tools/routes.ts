import type { FastifyInstance } from "fastify";
import { ToolsHandlers } from "./handlers.ts";

export async function toolsRoutes(fastify: FastifyInstance) {
	const handlers = new ToolsHandlers(fastify.config.ELEVENLABS_API_KEY);

	fastify.post("/register", {
		handler: handlers.registerAll.bind(handlers),
	});

	fastify.get("/", {
		handler: handlers.getAll.bind(handlers),
	});
}
