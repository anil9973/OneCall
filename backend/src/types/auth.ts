export type OwnerPlan = "free" | "basic" | "premium";

export type VerificationMethod = "dns" | "html_meta" | "file_upload";

export interface Owner {
	id: string;
	email: string;
	name: string;
	company?: string;
	plan: OwnerPlan;
	createdAt: number;
	emailVerified: boolean;
}

export interface Domain {
	id: string;
	ownerId: string;
	domain: string;
	verified: boolean;
	verificationMethod?: VerificationMethod;
	verificationCode: string;
	verifiedAt?: number;
	createdAt: number;
	settings: DomainSettings;
}

export interface DomainSettings {
	allowEscalation: boolean;
	workingHours?: {
		timezone: string;
		monday?: { start: string; end: string };
		tuesday?: { start: string; end: string };
		wednesday?: { start: string; end: string };
		thursday?: { start: string; end: string };
		friday?: { start: string; end: string };
		saturday?: { start: string; end: string };
		sunday?: { start: string; end: string };
	};
	voiceId?: string;
	autoEscalateKeywords?: string[];
	maxAIDuration?: number;
}

export interface JWTPayload {
	ownerId: string;
	email: string;
	verified: boolean;
	plan: OwnerPlan;
	type: "owner" | "call";
}

export interface SignupData {
	email: string;
	password: string;
	name: string;
	company?: string;
}

export interface LoginData {
	email: string;
	password: string;
}
