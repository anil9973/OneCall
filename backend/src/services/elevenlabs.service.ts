import type { WebsiteType, UserContext, VoiceInfo, VoiceFilterCriteria } from "../types/index.ts";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { VoiceSelector } from "../config/voices.ts";
import { AgentRegistry } from "../config/agents.ts";

type TokenResponse = {
	token: string;
};

export class ElevenLabsService {
	private readonly client: ElevenLabsClient;
	private readonly voiceSelector: VoiceSelector;
	private readonly agentRegistry: AgentRegistry;
	private readonly apiKey: string;

	constructor(apiKey: string) {
		this.client = new ElevenLabsClient({ apiKey, environment: "https://api.elevenlabs.io" });
		this.voiceSelector = new VoiceSelector(apiKey);
		this.agentRegistry = new AgentRegistry();
		this.apiKey = apiKey;
	}

	/** Generate conversation token for client */
	async getConversationToken(
		websiteType: WebsiteType = "base",
		userContext?: UserContext,
		explicitVoiceId?: string
	): Promise<{ token: string; agentId: string; expiresIn: number; voiceId: string; voiceName: string }> {
		const agent = this.agentRegistry.getAgent(websiteType);

		let voice: VoiceInfo;

		if (explicitVoiceId) {
			voice = (await this.voiceSelector.getById(explicitVoiceId)) ?? (await this.getDefaultVoice());
		} else if (userContext) {
			voice = await this.voiceSelector.select({
				gender: userContext.gender,
				age: userContext.ageGroup,
				accent: userContext.accent,
				useCase: "conversational",
			});
		} else {
			voice = await this.getDefaultVoice();
		}

		const request = new Request(`https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${agent.id}`, {
			headers: { "xi-api-key": this.apiKey },
		});
		const response = await fetch(request);

		if (!response.ok) {
			const error = await response.text();
			throw new Error(`Failed to get conversation token: ${error}`);
		}

		const body = (await response.json()) as TokenResponse;

		return {
			token: body.token,
			agentId: agent.id,
			voiceId: voice.voice_id,
			voiceName: voice.name,
			expiresIn: 600,
		};
	}

	/** Get all available voices */
	async getVoices(): Promise<VoiceInfo[]> {
		return this.voiceSelector.fetchVoices();
	}

	/** Get filtered voices */
	async getFilteredVoices(criteria: VoiceFilterCriteria): Promise<VoiceInfo[]> {
		const allVoices = await this.voiceSelector.fetchVoices();
		return allVoices.filter((voice) => {
			const labels = voice.labels || {};
			if (criteria.gender && labels.gender?.toLowerCase() !== criteria.gender) return false;
			if (criteria.age && labels.age?.toLowerCase() !== criteria.age) return false;
			if (criteria.accent && labels.accent?.toLowerCase() !== criteria.accent) return false;
			if (criteria.useCase && labels.use_case?.toLowerCase() !== criteria.useCase) return false;
			return true;
		});
	}

	/** Get default conversational voice */
	private async getDefaultVoice(): Promise<VoiceInfo> {
		const conversational = await this.voiceSelector.getConversational();
		return conversational[0] ?? (await this.voiceSelector.fetchVoices())[0];
	}

	/** Register a tool with ElevenLabs */
	async registerTool(toolConfig: any): Promise<void> {
		try {
			await this.client.conversationalAi.tools.create({ toolConfig });
		} catch (error) {
			console.error(`Failed to register tool ${toolConfig.name}:`, error);
			throw error;
		}
	}

	/** Register multiple tools */
	async registerTools(toolConfigs: any[]): Promise<void> {
		const results = await Promise.allSettled(toolConfigs.map((config) => this.registerTool(config)));

		const failed = results.filter((r) => r.status === "rejected");
		if (failed.length > 0) console.warn(`${failed.length} tools failed to register`);
	}

	getAgents() {
		return this.agentRegistry.getAllAgents();
	}

	getAgent(type: WebsiteType) {
		return this.agentRegistry.getAgent(type);
	}
}
