import fp from "fastify-plugin";
import fastifyEnv from "@fastify/env";

const schema = {
	type: "object",
	required: ["ELEVENLABS_API_KEY"],
	properties: {
		NODE_ENV: { type: "string", default: "development" },
		PORT: { type: "number", default: 3000 },
		HOST: { type: "string", default: "0.0.0.0" },
		ELEVENLABS_API_KEY: { type: "string" },
		AGENT_BASE_ID: { type: "string" },
		AGENT_ECOMMERCE_ID: { type: "string" },
		AGENT_FINANCE_ID: { type: "string" },
		AGENT_ENTERTAINMENT_ID: { type: "string" },
		AGENT_EDUTECH_ID: { type: "string" },
		RATE_LIMIT_MAX: { type: "number", default: 100 },
		RATE_LIMIT_WINDOW: { type: "number", default: 60000 },
		CORS_ORIGIN: { type: "string", default: "chrome-extension://*" },
	},
};

export default fp(async (fastify) => {
	await fastify.register(fastifyEnv, { schema, dotenv: true });
});
