import { Conversation } from "../../lib/elevenlabs/conversation.js";
// import { Conversation } from "@elevenlabs/client";
//prettier-ignore
import type { Conversation as Conversation2, Callbacks, Mode, Status, DisconnectionDetails } from "@elevenlabs/client";
import { WebRTCManager } from "../webrtc/webrtc-manager.js";
import { BACKEND_URL } from "../../shared/constants.js";
import { ToolRegistry } from "./tool-registry.js";
import { AudioOutputManager } from "../audio/AudioOutputManager.js";
import { ConversationStateAdapter } from "./StateAdapter.js";
import { AgentToolName } from "../../shared/protocol.js";

// Extract types from callback parameters using utility types
type ExtractCallbackParam<T> = T extends (param: infer P) => any ? P : never;
type MessagePayload = ExtractCallbackParam<NonNullable<Callbacks["onMessage"]>>;
type ClientToolCall = ExtractCallbackParam<NonNullable<Callbacks["onUnhandledClientToolCall"]>>;
type McpConnectionStatus = ExtractCallbackParam<NonNullable<Callbacks["onMCPConnectionStatus"]>>;
type AgentToolRequest = ExtractCallbackParam<NonNullable<Callbacks["onAgentToolRequest"]>>;
type AgentToolResponse = ExtractCallbackParam<NonNullable<Callbacks["onAgentToolResponse"]>>;
type ConversationMetadata = ExtractCallbackParam<NonNullable<Callbacks["onConversationMetadata"]>>;
type AsrInitiationMetadataEvent = ExtractCallbackParam<NonNullable<Callbacks["onAsrInitiationMetadata"]>>;

type TokenResponse = {
	token: string;
	agentId: string;
	voiceId: string;
};

type Tab = {
	id: number;
	url: string;
};

export class ConversationManager {
	private conversation: Conversation2 | null = null;
	private tab: Tab;
	private sessionStartTime: number = 0;
	private conversationId!: string;
	private retryCount = 0;
	private MAX_RETRIES = 3;
	private toolRegistry: ToolRegistry;
	private webrtcManager: WebRTCManager;
	private audioManager: AudioOutputManager;
	private uiAdapter: ConversationStateAdapter;

	constructor(tab: Tab) {
		this.tab = tab;
		this.toolRegistry = new ToolRegistry(tab.id);
		this.webrtcManager = new WebRTCManager();
		this.audioManager = new AudioOutputManager(tab.id);
		this.uiAdapter = new ConversationStateAdapter(tab.id);
	}

	private async getToken(websiteType: string): Promise<TokenResponse> {
		const response = await fetch(`${BACKEND_URL}/api/conversation/token`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ websiteType }),
		});
		if (!response.ok) throw new Error("Failed to get conversation token");
		return await response.json();
	}

	async startConversation(initialContext: any) {
		try {
			const rawAudioProcessor = chrome.runtime.getURL("lib/elevenlabs/worklets/rawAudioProcessor.js");
			const audioConcatProcessor = chrome.runtime.getURL("lib/elevenlabs/worklets/audioConcatProcessor.js");
			const libsampleratePath = chrome.runtime.getURL("lib/elevenlabs/worklets/libsamplerate.js");
			const clientTools = await this.toolRegistry.getToolsConfig(this.tab.url);
			const tokenData = await this.getToken(initialContext.location.websiteType);

			this.conversation = await Conversation.startSession({
				conversationToken: tokenData.token,
				// agentId: agentId,
				// signedUrl: token,
				connectionType: "webrtc",
				workletPaths: {
					rawAudioProcessor: rawAudioProcessor,
					audioConcatProcessor: audioConcatProcessor,
				},
				libsampleratePath: libsampleratePath,

				onConnect: (props: { conversationId: string }) => this.handleConnect(props, initialContext),
				onDisconnect: (details: DisconnectionDetails) => this.handleDisconnect(details),
				onError: (message: string, context?: any) => this.handleError(message, context),
				onMessage: (props: MessagePayload) => this.uiAdapter.sendTranscript(props.role, props.message),
				onAudio: (base64Audio: string) => this.audioManager.enqueueAudio(base64Audio),
				onModeChange: (prop: { mode: Mode }) => this.uiAdapter.sendModeChange(prop.mode),
				onStatusChange: (prop: { status: Status }) => this.uiAdapter.sendStateChange(prop.status),
				onUnhandledClientToolCall: (params: ClientToolCall) => this.handleClientToolCall(params),
				onConversationMetadata: (props: ConversationMetadata) => this.handleConversationMetadata(props),
				onVadScore: (props: { vadScore: number }) => this.handleVadScore(props),
				onDebug: (props: any) => this.handleDebug(props),

				//Log this
				onMCPConnectionStatus: (props: McpConnectionStatus) => this.handleMCPConnectionStatus(props),
				onAgentToolRequest: (props: AgentToolRequest) => this.handleAgentToolRequest(props),
				onAgentToolResponse: (props: AgentToolResponse) => this.handleAgentToolResponse(props),
				onAsrInitiationMetadata: (props: Record<string, any>) => this.handleAsrInitiationMetadata(props),

				clientTools: clientTools,
			});
		} catch (error) {
			this.conversation?.endSession();
			console.error(`Failed to start conversation for tab ${this.tab.id}:`, error);
		}
	}

	/* Call function when Uiwidget comamnd to excute */
	setVolume(volume: number): void {
		this.conversation!.setVolume({ volume });
	}

	setMicMuted(isMuted: boolean): void {
		this.conversation!.setMicMuted(isMuted);
	}

	sendContextualUpdate(context: string): void {
		this.conversation!.sendContextualUpdate(context);
	}

	sendUserMessage(text: string): void {
		// if (!this.conversation) return;
		this.conversation!.sendUserMessage(text);
	}

	private handleConnect(props: { conversationId: string }, initialContext: any): void {
		this.conversationId = props.conversationId;
		console.log("[ElevenLabs] Connected:", this.conversationId);
		this.sessionStartTime = Date.now();
		this.uiAdapter.startSession();
		setTimeout(() => this.sendContextualUpdate(JSON.stringify(initialContext)), 0);
	}

	private handleDisconnect(details: any): void {
		console.log("[ElevenLabs] Disconnected:", details);
		this.uiAdapter.sendStateChange("disconnected");
		this.saveSessionMetadata(details);
	}

	private handleError(message: string, context?: any): void {
		console.error("[ElevenLabs] Error:", message, context);
		this.appendConversationLog({ type: "debug", payload: { message, context } });

		/* this.addSystemMessage(`An error occurred: ${message}`);

		if (context?.code === "microphone_permission_denied") {
			this.addSystemMessage("Microphone access denied. Please allow microphone access and try again.");
		} else if (context?.code === "connection_failed") {
			this.addSystemMessage("Connection failed. Retrying...");
			setTimeout(() => this.reconnect(), 2000);
		} */
	}

	private async handleClientToolCall(params: ClientToolCall): Promise<void> {
		const { tool_name, tool_call_id, parameters } = params;
		console.log("[Tool Call]", tool_name, parameters);

		try {
			let result: unknown;
			//@ts-ignore
			if (this.toolRegistry.isLocalTool(tool_name)) {
				result = await chrome.runtime.sendMessage({ type: "EXECUTE_TOOL", toolName: tool_name, parameters });
			} else if (this.toolRegistry.isOwnerTool(tool_name)) {
				result = await this.toolRegistry.executeOwnerTool(tool_name, parameters);
			} else {
				throw new Error(`Unknown tool: ${tool_name}`);
			}

			const text = JSON.stringify({ toolCallId: tool_call_id, result: JSON.stringify(result) });
			this.conversation!.sendContextualUpdate(text);
		} catch (error) {
			console.error("[Tool Error]", error);
			const text = JSON.stringify({
				toolCallId: tool_call_id,
				result: JSON.stringify({ error: String(error) }),
				isError: true,
			});
			this.conversation!.sendContextualUpdate(text);
		}
	}

	private handleConversationMetadata(props: ConversationMetadata): void {
		console.log("[Metadata]", props);
		this.appendConversationLog({ type: "conversation_metadata", payload: props });
	}

	/* Debug purpose */
	private handleVadScore(props: { vadScore: number }): void {
		console.log("[VAD Score]", props.vadScore);
	}

	private handleDebug(props: any): void {
		console.log("[Debug]", props);
		this.appendConversationLog({ type: "debug", payload: props });
	}

	private handleMCPConnectionStatus(props: McpConnectionStatus): void {
		if (!this.conversationId) return;

		console.log("[MCP Connection Status]", props);
		this.appendConversationLog({ type: "mcp_connection_status", payload: props });
	}

	private handleAgentToolRequest(event: AgentToolRequest): void {
		if (!this.conversationId) return;

		console.log("[Agent Tool Request]", event);
		this.appendConversationLog({ type: "agent_tool_request", payload: event });
	}

	private handleAgentToolResponse(event: AgentToolResponse): void {
		if (!this.conversationId) return;

		console.log("[Agent Tool Response]", event);
		this.appendConversationLog({ type: "agent_tool_response", payload: event });
	}

	private handleAsrInitiationMetadata(props: AsrInitiationMetadataEvent): void {
		if (!this.conversationId) return;

		console.log("[ASR Initiation Metadata]", props);
		this.appendConversationLog({ type: "asr_initiation_metadata", payload: props });
	}

	async endConversation() {
		try {
			await this.conversation!.endSession();
			this.audioManager.close();
			console.log(`Conversation ended for tab ${this.tab.id}`);
		} catch (error) {
			console.error(`Failed to end conversation for tab ${this.tab.id}:`, error);
		}
	}

	/* Helper methods */
	private async saveSessionMetadata(disconnectDetails: any) {
		await this.appendConversationLog({ type: "disconnect", props: disconnectDetails });
		// Save to backend
		/* await fetch(`${BACKEND_URL}/conversation/save-session`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				conversationId: this.conversationId,
				duration: Date.now() - this.sessionStartTime,
				disconnectDetails,
			}),
		}); */
	}

	private async appendConversationLog(entry: Record<string, any>) {
		const key = `conversation:${this.conversationId}`;
		const conversationLogs = (await chrome.storage.local.get(key))[key] ?? {};
		//@ts-ignore
		conversationLogs[String(Date.now())] = entry;
		await chrome.storage.local.set({ [key]: conversationLogs });
	}
}
