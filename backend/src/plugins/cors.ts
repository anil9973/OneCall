/* import fp from "fastify-plugin";
import cors from "@fastify/cors";

export default fp(async (fastify) => {
	await fastify.register(cors, {
		origin: (origin, cb) => {
			const allowedOrigin = fastify.config.CORS_ORIGIN;

			// Allow chrome extension
			if (origin?.startsWith("chrome-extension://")) {
				cb(null, true);
				return;
			}

			// Allow configured origin
			if (origin === allowedOrigin || allowedOrigin === "*") {
				cb(null, true);
				return;
			}

			cb(new Error("Not allowed by CORS"), false);
		},
		credentials: true,
	});
});
 */
