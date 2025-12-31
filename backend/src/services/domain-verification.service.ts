import type { Firestore } from "firebase-admin/firestore";
import type { Domain, VerificationMethod } from "../types/auth.ts";
import { nanoid } from "nanoid";
import { promises as dns } from "dns";

export class DomainVerificationService {
	private firestore: Firestore;
	constructor(firestore: Firestore) {
		this.firestore = firestore;
	}

	async addDomain(ownerId: string, domain: string): Promise<Domain> {
		const normalized = this.normalizeDomain(domain);

		const existing = await this.getDomainByName(normalized);
		if (existing) {
			throw new Error("Domain already exists");
		}

		const domainDoc: Domain = {
			id: nanoid(21),
			ownerId,
			domain: normalized,
			verified: false,
			verificationCode: this.generateVerificationCode(),
			createdAt: Date.now(),
			settings: {
				allowEscalation: true,
				maxAIDuration: 300,
			},
		};

		await this.firestore
			.collection("domains")
			.doc(domainDoc.id)
			.set({
				...domainDoc,
				createdAt: new Date(domainDoc.createdAt),
			});

		return domainDoc;
	}

	async verifyDomain(domainId: string, method: VerificationMethod): Promise<boolean> {
		const domain = await this.getDomain(domainId);
		if (!domain) {
			throw new Error("Domain not found");
		}

		if (domain.verified) {
			return true;
		}

		let verified = false;

		switch (method) {
			case "dns":
				verified = await this.verifyDNS(domain.domain, domain.verificationCode);
				break;
			case "html_meta":
				verified = await this.verifyHTMLMeta(domain.domain, domain.verificationCode);
				break;
			case "file_upload":
				verified = await this.verifyFile(domain.domain, domain.verificationCode);
				break;
		}

		if (verified) {
			await this.firestore.collection("domains").doc(domainId).update({
				verified: true,
				verificationMethod: method,
				verifiedAt: new Date(),
			});
		}

		return verified;
	}

	private async verifyDNS(domain: string, code: string): Promise<boolean> {
		try {
			const records = await dns.resolveTxt(domain);

			return records.some((record) => {
				const txtValue = Array.isArray(record) ? record.join("") : record;
				return txtValue === `onecall-verify=${code}`;
			});
		} catch (error) {
			return false;
		}
	}

	private async verifyHTMLMeta(domain: string, code: string): Promise<boolean> {
		try {
			const response = await fetch(`https://${domain}`, {
				method: "GET",
				headers: { "User-Agent": "OneCall-Verifier/1.0" },
			});

			if (!response.ok) return false;

			const html = await response.text();
			const metaRegex = new RegExp(`<meta\\s+name=["']onecall-verify["']\\s+content=["']${code}["']`, "i");

			return metaRegex.test(html);
		} catch (error) {
			return false;
		}
	}

	private async verifyFile(domain: string, code: string): Promise<boolean> {
		try {
			const response = await fetch(`https://${domain}/.well-known/onecall-verify.txt`, {
				method: "GET",
			});

			if (!response.ok) return false;

			const content = await response.text();
			return content.trim() === code;
		} catch (error) {
			return false;
		}
	}

	async getDomain(domainId: string): Promise<Domain | null> {
		const doc = await this.firestore.collection("domains").doc(domainId).get();

		if (!doc.exists) return null;

		const data = doc.data();
		if (!data) return null;

		return {
			id: doc.id,
			ownerId: data.ownerId,
			domain: data.domain,
			verified: data.verified,
			verificationMethod: data.verificationMethod,
			verificationCode: data.verificationCode,
			verifiedAt: data.verifiedAt?.toMillis(),
			createdAt: data.createdAt.toMillis(),
			settings: data.settings,
		};
	}

	async getDomainByName(domain: string): Promise<Domain | null> {
		const normalized = this.normalizeDomain(domain);

		const snapshot = await this.firestore.collection("domains").where("domain", "==", normalized).limit(1).get();

		if (snapshot.empty) return null;

		const doc = snapshot.docs[0];
		const data = doc.data();

		return {
			id: doc.id,
			ownerId: data.ownerId,
			domain: data.domain,
			verified: data.verified,
			verificationMethod: data.verificationMethod,
			verificationCode: data.verificationCode,
			verifiedAt: data.verifiedAt?.toMillis(),
			createdAt: data.createdAt.toMillis(),
			settings: data.settings,
		};
	}

	async listDomains(ownerId: string): Promise<Domain[]> {
		const snapshot = await this.firestore
			.collection("domains")
			.where("ownerId", "==", ownerId)
			.orderBy("createdAt", "desc")
			.get();

		return snapshot.docs.map((doc) => {
			const data = doc.data();
			return {
				id: doc.id,
				ownerId: data.ownerId,
				domain: data.domain,
				verified: data.verified,
				verificationMethod: data.verificationMethod,
				verificationCode: data.verificationCode,
				verifiedAt: data.verifiedAt?.toMillis(),
				createdAt: data.createdAt.toMillis(),
				settings: data.settings,
			};
		});
	}

	async updateDomainSettings(domainId: string, settings: Partial<Domain["settings"]>): Promise<void> {
		const domain = await this.getDomain(domainId);
		if (!domain) {
			throw new Error("Domain not found");
		}

		const updatedSettings = { ...domain.settings, ...settings };

		await this.firestore.collection("domains").doc(domainId).update({ settings: updatedSettings });
	}

	async deleteDomain(domainId: string): Promise<void> {
		await this.firestore.collection("domains").doc(domainId).delete();
	}

	async verifyOwnership(ownerId: string, domain: string): Promise<boolean> {
		const normalized = this.normalizeDomain(domain);

		const snapshot = await this.firestore
			.collection("domains")
			.where("ownerId", "==", ownerId)
			.where("domain", "==", normalized)
			.where("verified", "==", true)
			.limit(1)
			.get();

		return !snapshot.empty;
	}

	private normalizeDomain(domain: string): string {
		return domain
			.toLowerCase()
			.replace(/^https?:\/\//, "")
			.replace(/^www\./, "")
			.replace(/\/$/, "");
	}

	private generateVerificationCode(): string {
		return nanoid(32);
	}

	async regenerateVerificationCode(domainId: string): Promise<string> {
		const newCode = this.generateVerificationCode();

		await this.firestore.collection("domains").doc(domainId).update({
			verificationCode: newCode,
			verified: false,
			verificationMethod: null,
			verifiedAt: null,
		});

		return newCode;
	}
}
