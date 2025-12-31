import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import type { VoiceFilterCriteria } from "../../types/index.ts";
import { ElevenLabsService } from "../../services/elevenlabs.service.ts";

export async function voicesRoutes(fastify: FastifyInstance) {
	const service = new ElevenLabsService(fastify.config.ELEVENLABS_API_KEY);

	/** Get all voices */
	fastify.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
		try {
			const voices = await service.getVoices();
			return reply.code(200).send({ voices });
		} catch (error) {
			request.log.error(error, "Failed to fetch voices");
			return reply.code(500).send({
				error: "Failed to fetch voices",
				message: error instanceof Error ? error.message : "Unknown error",
			});
		}
	});

	/** Get filtered voices */
	fastify.post<{ Body: VoiceFilterCriteria }>("/filter", async (request, reply) => {
		try {
			const voices = await service.getFilteredVoices(request.body);
			return reply.code(200).send({ voices });
		} catch (error) {
			request.log.error(error, "Failed to filter voices");
			return reply.code(500).send({
				error: "Failed to filter voices",
				message: error instanceof Error ? error.message : "Unknown error",
			});
		}
	});
}
