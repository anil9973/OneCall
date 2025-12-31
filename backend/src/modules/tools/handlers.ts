import type { FastifyRequest, FastifyReply } from "fastify";
import { ElevenLabsService } from "../../services/elevenlabs.service.ts";
import { getAllToolDefinitions } from "../../config/tools.ts";

export class ToolsHandlers {
	private elevenLabsService: ElevenLabsService;

	constructor(apiKey: string) {
		this.elevenLabsService = new ElevenLabsService(apiKey);
	}

	/** Register all tools */
	async registerAll(request: FastifyRequest, reply: FastifyReply) {
		try {
			const tools = getAllToolDefinitions();
			await this.elevenLabsService.registerTools(tools);

			return reply.code(200).send({
				success: true,
				registered: tools.length,
				failed: 0,
			});
		} catch (error) {
			request.log.error(error, "Failed to register tools");
			return reply.code(500).send({
				success: false,
				registered: 0,
				failed: 0,
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	}

	/** Get all tool definitions */
	async getAll(request: FastifyRequest, reply: FastifyReply) {
		try {
			const tools = getAllToolDefinitions();
			return reply.code(200).send({ tools });
		} catch (error) {
			request.log.error(error, "Failed to get tools");
			return reply.code(500).send({
				error: "Failed to get tools",
				message: error instanceof Error ? error.message : "Unknown error",
			});
		}
	}
}
