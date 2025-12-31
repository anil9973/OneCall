/* import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

async function swaggerPlugin(fastify: FastifyInstance) {
	await fastify.register(swagger, {
		openapi: {
			info: {
				title: "OneCall API",
				description: "AI-powered voice support platform API documentation",
				version: "1.0.0",
				contact: {
					name: "OneCall Support",
					email: "support@onecall.ai",
				},
			},
			servers: [
				{
					url: "http://localhost:3000",
					description: "Development",
				},
				{
					url: "https://api.onecall.ai",
					description: "Production",
				},
			],
			tags: [
				{ name: "auth", description: "Authentication endpoints" },
				{ name: "domains", description: "Domain management" },
				{ name: "calls", description: "Call management" },
				{ name: "conversations", description: "Conversation history" },
				{ name: "knowledge", description: "Knowledge base" },
				{ name: "tools", description: "Tool configuration" },
				{ name: "tool-execution", description: "Tool execution" },
				{ name: "notifications", description: "Push notifications" },
			],
			components: {
				securitySchemes: {
					bearerAuth: {
						type: "http",
						scheme: "bearer",
						bearerFormat: "JWT",
					},
				},
			},
		},
	});

	await fastify.register(swaggerUi, {
		routePrefix: "/docs",
		uiConfig: {
			docExpansion: "list",
			deepLinking: true,
			displayRequestDuration: true,
		},
		staticCSP: true,
		transformStaticCSP: (header) => header,
	});
}

export default fp(swaggerPlugin, { name: "swagger-plugin" }); */
