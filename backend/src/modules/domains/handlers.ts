import type { FastifyRequest, FastifyReply } from "fastify";
import type { DomainVerificationService } from "../../services/domain-verification.service.ts";
import type { VerificationMethod, DomainSettings } from "../../types/auth.js";

export class DomainHandlers {
	private domainService: DomainVerificationService;
	constructor(domainService: DomainVerificationService) {
		this.domainService = domainService;
	}

	async addDomain(request: FastifyRequest<{ Body: { domain: string } }>, reply: FastifyReply) {
		const ownerId = request.owner?.id;
		if (!ownerId) return reply.code(401).send({ error: "Unauthorized" });

		const domain = await this.domainService.addDomain(ownerId, request.body.domain);

		return {
			id: domain.id,
			domain: domain.domain,
			verificationCode: domain.verificationCode,
			verificationMethods: [
				{
					type: "dns",
					instructions: `Add TXT record: onecall-verify=${domain.verificationCode}`,
					record: `onecall-verify=${domain.verificationCode}`,
				},
				{
					type: "html_meta",
					instructions: `Add meta tag to homepage: <meta name="onecall-verify" content="${domain.verificationCode}">`,
					tag: `<meta name="onecall-verify" content="${domain.verificationCode}">`,
				},
				{
					type: "file_upload",
					instructions: `Upload file to: /.well-known/onecall-verify.txt with content: ${domain.verificationCode}`,
					path: "/.well-known/onecall-verify.txt",
					content: domain.verificationCode,
				},
			],
		};
	}

	async verifyDomain(
		request: FastifyRequest<{ Params: { id: string }; Body: { method: VerificationMethod } }>,
		reply: FastifyReply
	) {
		const ownerId = request.owner?.id;
		const { id } = request.params;
		const { method } = request.body;
		if (!ownerId) return reply.code(401).send({ error: "Unauthorized" });

		const domain = await this.domainService.getDomain(id);
		if (!domain) return reply.code(404).send({ error: "Domain not found" });
		if (domain.ownerId !== ownerId) return reply.code(403).send({ error: "Not your domain" });

		const verified = await this.domainService.verifyDomain(id, method);

		if (!verified) {
			return reply.code(400).send({
				error: "Verification failed",
				message: this.getVerificationFailureMessage(method),
			});
		}

		const updatedDomain = await this.domainService.getDomain(id);

		return {
			verified: true,
			verifiedAt: updatedDomain?.verifiedAt,
			method,
		};
	}

	async listDomains(request: FastifyRequest, reply: FastifyReply) {
		const ownerId = request.owner?.id;
		if (!ownerId) return reply.code(401).send({ error: "Unauthorized" });

		const domains = await this.domainService.listDomains(ownerId);

		return {
			domains: domains.map((d) => ({
				id: d.id,
				domain: d.domain,
				verified: d.verified,
				verificationMethod: d.verificationMethod,
				createdAt: d.createdAt,
				verifiedAt: d.verifiedAt,
			})),
		};
	}

	async getDomain(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
		const ownerId = request.owner?.id;
		const { id } = request.params;
		if (!ownerId) return reply.code(401).send({ error: "Unauthorized" });

		const domain = await this.domainService.getDomain(id);
		if (!domain) return reply.code(404).send({ error: "Domain not found" });
		if (domain.ownerId !== ownerId) return reply.code(403).send({ error: "Not your domain" });

		return {
			id: domain.id,
			domain: domain.domain,
			verified: domain.verified,
			verificationCode: domain.verificationCode,
			verificationMethod: domain.verificationMethod,
			verifiedAt: domain.verifiedAt,
			createdAt: domain.createdAt,
			settings: domain.settings,
		};
	}

	async updateDomainSettings(
		request: FastifyRequest<{ Params: { id: string }; Body: Partial<DomainSettings> }>,
		reply: FastifyReply
	) {
		const ownerId = request.owner?.id;
		const { id } = request.params;
		if (!ownerId) return reply.code(401).send({ error: "Unauthorized" });

		const domain = await this.domainService.getDomain(id);
		if (!domain) return reply.code(404).send({ error: "Domain not found" });
		if (domain.ownerId !== ownerId) return reply.code(403).send({ error: "Not your domain" });

		await this.domainService.updateDomainSettings(id, request.body);
		return { success: true };
	}

	async deleteDomain(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
		const ownerId = request.owner?.id;
		const { id } = request.params;
		if (!ownerId) return reply.code(401).send({ error: "Unauthorized" });

		const domain = await this.domainService.getDomain(id);
		if (!domain) return reply.code(404).send({ error: "Domain not found" });
		if (domain.ownerId !== ownerId) return reply.code(403).send({ error: "Not your domain" });

		await this.domainService.deleteDomain(id);

		return { success: true };
	}

	async regenerateCode(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
		const ownerId = request.owner?.id;
		const { id } = request.params;
		if (!ownerId) return reply.code(401).send({ error: "Unauthorized" });

		const domain = await this.domainService.getDomain(id);
		if (!domain) return reply.code(404).send({ error: "Domain not found" });
		if (domain.ownerId !== ownerId) return reply.code(403).send({ error: "Not your domain" });

		const newCode = await this.domainService.regenerateVerificationCode(id);

		return { verificationCode: newCode };
	}

	private getVerificationFailureMessage(method: VerificationMethod): string {
		const messages = {
			dns: "DNS TXT record not found. Please ensure the record is added and propagated (may take up to 48 hours).",
			html_meta: "Meta tag not found in homepage HTML. Please ensure the tag is in the <head> section.",
			file_upload:
				"Verification file not found at /.well-known/onecall-verify.txt. Please upload the file with exact content.",
		};

		return messages[method] || "Verification failed";
	}
}
