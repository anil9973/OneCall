import type { Auth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";
import type { Owner, SignupData, LoginData } from "../types/auth.ts";
import { nanoid } from "nanoid";

export class AuthService {
	private auth: Auth;
	private firestore: Firestore;

	constructor(auth: Auth, firestore: Firestore) {
		this.auth = auth;
		this.firestore = firestore;
	}

	async signup(data: SignupData): Promise<{ owner: Owner; userId: string }> {
		const userRecord = await this.auth.createUser({
			email: data.email,
			password: data.password,
			emailVerified: false,
			displayName: data.name,
		});

		const owner: Owner = {
			id: nanoid(21),
			email: data.email,
			name: data.name,
			company: data.company,
			plan: "free",
			createdAt: Date.now(),
			emailVerified: false,
		};

		await this.firestore
			.collection("owners")
			.doc(owner.id)
			.set({
				...owner,
				firebaseUid: userRecord.uid,
				createdAt: new Date(owner.createdAt),
			});

		await this.firestore.collection("user_owner_mapping").doc(userRecord.uid).set({
			ownerId: owner.id,
			email: data.email,
			createdAt: new Date(),
		});

		const verificationLink = await this.auth.generateEmailVerificationLink(data.email);

		return { owner, userId: userRecord.uid };
	}

	async verifyFirebaseToken(token: string): Promise<{ uid: string; email: string }> {
		const decodedToken = await this.auth.verifyIdToken(token);
		return {
			uid: decodedToken.uid,
			email: decodedToken.email || "",
		};
	}

	async getOwnerByFirebaseUid(uid: string): Promise<Owner | null> {
		const mappingDoc = await this.firestore.collection("user_owner_mapping").doc(uid).get();

		if (!mappingDoc.exists) return null;

		const mapping = mappingDoc.data();
		if (!mapping) return null;

		return this.getOwnerById(mapping.ownerId);
	}

	async getOwnerById(ownerId: string): Promise<Owner | null> {
		const doc = await this.firestore.collection("owners").doc(ownerId).get();

		if (!doc.exists) return null;

		const data = doc.data();
		if (!data) return null;

		return {
			id: doc.id,
			email: data.email,
			name: data.name,
			company: data.company,
			plan: data.plan,
			createdAt: data.createdAt.toMillis(),
			emailVerified: data.emailVerified,
		};
	}

	async updateOwner(ownerId: string, updates: Partial<Owner>): Promise<void> {
		const updateData: Record<string, unknown> = {};

		updates.name && (updateData.name = updates.name);
		updates.company && (updateData.company = updates.company);
		updates.plan && (updateData.plan = updates.plan);
		updates.emailVerified !== undefined && (updateData.emailVerified = updates.emailVerified);

		await this.firestore.collection("owners").doc(ownerId).update(updateData);
	}

	async deleteOwner(ownerId: string): Promise<void> {
		const ownerDoc = await this.firestore.collection("owners").doc(ownerId).get();

		if (!ownerDoc.exists) return;

		const data = ownerDoc.data();
		const firebaseUid = data?.firebaseUid;

		if (firebaseUid) {
			await this.auth.deleteUser(firebaseUid);
			await this.firestore.collection("user_owner_mapping").doc(firebaseUid).delete();
		}

		await this.firestore.collection("owners").doc(ownerId).delete();
	}

	async setCustomClaims(uid: string, claims: Record<string, unknown>): Promise<void> {
		await this.auth.setCustomUserClaims(uid, claims);
	}

	async verifyEmail(ownerId: string): Promise<void> {
		await this.updateOwner(ownerId, { emailVerified: true });
	}

	async sendPasswordResetEmail(email: string): Promise<string> {
		return this.auth.generatePasswordResetLink(email);
	}
}
