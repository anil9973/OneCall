import type { FastifyRequest, FastifyReply } from "fastify";
import type { AuthService } from "../../services/auth.service.ts";
import type { SignupData, LoginData } from "../../types/auth.ts";

export class AuthHandlers {
	private authService: AuthService;
	constructor(authService: AuthService) {
		this.authService = authService;
	}

	async signup(request: FastifyRequest<{ Body: SignupData }>, reply: FastifyReply) {
		const { owner, userId } = await this.authService.signup(request.body);

		const token = await reply.jwtSign(
			{
				ownerId: owner.id,
				email: owner.email,
				verified: owner.emailVerified,
				plan: owner.plan,
				type: "owner",
			},
			{ expiresIn: "7d" }
		);

		return {
			owner: {
				id: owner.id,
				email: owner.email,
				name: owner.name,
				company: owner.company,
				plan: owner.plan,
				emailVerified: owner.emailVerified,
			},
			token,
		};
	}

	async login(request: FastifyRequest<{ Body: LoginData & { firebaseToken: string } }>, reply: FastifyReply) {
		const { firebaseToken } = request.body;

		const { uid } = await this.authService.verifyFirebaseToken(firebaseToken);
		const owner = await this.authService.getOwnerByFirebaseUid(uid);
		if (!owner) return reply.code(404).send({ error: "Owner not found" });

		const token = await reply.jwtSign(
			{
				ownerId: owner.id,
				email: owner.email,
				verified: owner.emailVerified,
				plan: owner.plan,
				type: "owner",
			},
			{ expiresIn: "7d" }
		);

		return {
			owner: {
				id: owner.id,
				email: owner.email,
				name: owner.name,
				company: owner.company,
				plan: owner.plan,
				emailVerified: owner.emailVerified,
			},
			token,
		};
	}

	async refreshToken(request: FastifyRequest<{ Body: { firebaseToken: string } }>, reply: FastifyReply) {
		const { firebaseToken } = request.body;

		const { uid } = await this.authService.verifyFirebaseToken(firebaseToken);
		const owner = await this.authService.getOwnerByFirebaseUid(uid);
		if (!owner) return reply.code(404).send({ error: "Owner not found" });

		const token = await reply.jwtSign(
			{
				ownerId: owner.id,
				email: owner.email,
				verified: owner.emailVerified,
				plan: owner.plan,
				type: "owner",
			},
			{ expiresIn: "7d" }
		);

		return { token };
	}

	async getMe(request: FastifyRequest, reply: FastifyReply) {
		const ownerId = request.owner?.id;
		if (!ownerId) return reply.code(401).send({ error: "Unauthorized" });
		const owner = await this.authService.getOwnerById(ownerId);
		if (!owner) return reply.code(404).send({ error: "Owner not found" });

		return {
			id: owner.id,
			email: owner.email,
			name: owner.name,
			company: owner.company,
			plan: owner.plan,
			emailVerified: owner.emailVerified,
			createdAt: owner.createdAt,
		};
	}

	async updateProfile(request: FastifyRequest<{ Body: { name?: string; company?: string } }>, reply: FastifyReply) {
		const ownerId = request.owner?.id;
		if (!ownerId) return reply.code(401).send({ error: "Unauthorized" });
		await this.authService.updateOwner(ownerId, request.body);
		return { success: true };
	}
}
