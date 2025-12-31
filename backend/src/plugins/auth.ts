import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

declare module "fastify" {
	interface FastifyRequest {
		owner?: {
			id: string;
			email: string;
			verified: boolean;
			plan: string;
		};
	}

	interface FastifyInstance {
		authenticate: (request: any, reply: any) => Promise<void>;
		authenticateOwner: (request: any, reply: any) => Promise<void>;
		authenticateOptional: (request: any, reply: any) => Promise<void>;
	}
}

async function authPlugin(fastify: FastifyInstance) {
	fastify.decorate("authenticate", async function (request: any, reply: any) {
		try {
			const token = request.headers.authorization?.replace("Bearer ", "");
			if (!token) return reply.code(401).send({ error: "No token provided" });

			const decoded = await request.jwtVerify();
			if (!decoded) return reply.code(401).send({ error: "Invalid token" });
		} catch (error) {
			return reply.code(401).send({ error: "Invalid token" });
		}
	});

	fastify.decorate("authenticateOwner", async function (request: any, reply: any) {
		try {
			const token = request.headers.authorization?.replace("Bearer ", "");
			if (!token) return reply.code(401).send({ error: "No token provided" });

			const decoded = await request.jwtVerify();
			if (!decoded || decoded.type !== "owner") return reply.code(403).send({ error: "Owner access required" });

			request.owner = {
				id: decoded.ownerId,
				email: decoded.email,
				verified: decoded.verified,
				plan: decoded.plan,
			};
		} catch (error) {
			return reply.code(401).send({ error: "Invalid token" });
		}
	});

	fastify.decorate("authenticateOptional", async function (request: any, reply: any) {
		try {
			const token = request.headers.authorization?.replace("Bearer ", "");
			if (!token) return;

			const decoded = await request.jwtVerify();
			if (decoded && decoded.type === "owner") {
				request.owner = {
					id: decoded.ownerId,
					email: decoded.email,
					verified: decoded.verified,
					plan: decoded.plan,
				};
			}
		} catch (error) {
			// Optional auth, so just continue
		}
	});
}

export default fp(authPlugin, {
	name: "auth-plugin",
	dependencies: ["@fastify/jwt"],
});
