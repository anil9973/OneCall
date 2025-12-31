import fp from "fastify-plugin";
/* import rateLimit from "@fastify/rate-limit";

export default fp(async (fastify) => {
	await fastify.register(rateLimit, {
		max: fastify.config.RATE_LIMIT_MAX,
		timeWindow: fastify.config.RATE_LIMIT_WINDOW,
		errorResponseBuilder: () => ({
			statusCode: 429,
			error: "Too Many Requests",
			message: "Rate limit exceeded. Please try again later.",
		}),
	});
}); */
