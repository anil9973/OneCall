import { Conversation } from "../../lib/elevenlabs/conversation.js";
import { WebRTCManager } from "../webrtc/webrtc-manager.js";
import { BACKEND_URL } from "../../shared/constants.js";
import { ToolRegistry } from "./tool-registry.js";
import { AudioOutputManager } from "../audio/AudioOutputManager.js";
import { ConversationStateAdapter } from "./StateAdapter.js";
class ConversationManager {
  conversation = null;
  tab;
  sessionStartTime = 0;
  conversationId;
  retryCount = 0;
  MAX_RETRIES = 3;
  toolRegistry;
  webrtcManager;
  audioManager;
  uiAdapter;
  constructor(tab) {
    this.tab = tab;
    this.toolRegistry = new ToolRegistry(tab.id);
    this.webrtcManager = new WebRTCManager();
    this.audioManager = new AudioOutputManager(tab.id);
    this.uiAdapter = new ConversationStateAdapter(tab.id);
  }
  async getToken(websiteType) {
    const response = await fetch(`${BACKEND_URL}/api/conversation/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ websiteType })
    });
    if (!response.ok)
      throw new Error("Failed to get conversation token");
    return await response.json();
  }
  async startConversation(initialContext) {
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
          rawAudioProcessor,
          audioConcatProcessor
        },
        libsampleratePath,
        onConnect: (props) => this.handleConnect(props, initialContext),
        onDisconnect: (details) => this.handleDisconnect(details),
        onError: (message, context) => this.handleError(message, context),
        onMessage: (props) => this.uiAdapter.sendTranscript(props.role, props.message),
        onAudio: (base64Audio) => this.audioManager.enqueueAudio(base64Audio),
        onModeChange: (prop) => this.uiAdapter.sendModeChange(prop.mode),
        onStatusChange: (prop) => this.uiAdapter.sendStateChange(prop.status),
        onUnhandledClientToolCall: (params) => this.handleClientToolCall(params),
        onConversationMetadata: (props) => this.handleConversationMetadata(props),
        onVadScore: (props) => this.handleVadScore(props),
        onDebug: (props) => this.handleDebug(props),
        //Log this
        onMCPConnectionStatus: (props) => this.handleMCPConnectionStatus(props),
        onAgentToolRequest: (props) => this.handleAgentToolRequest(props),
        onAgentToolResponse: (props) => this.handleAgentToolResponse(props),
        onAsrInitiationMetadata: (props) => this.handleAsrInitiationMetadata(props),
        clientTools
      });
    } catch (error) {
      this.conversation?.endSession();
      console.error(`Failed to start conversation for tab ${this.tab.id}:`, error);
    }
  }
  /* Call function when Uiwidget comamnd to excute */
  setVolume(volume) {
    this.conversation.setVolume({ volume });
  }
  setMicMuted(isMuted) {
    this.conversation.setMicMuted(isMuted);
  }
  sendContextualUpdate(context) {
    this.conversation.sendContextualUpdate(context);
  }
  sendUserMessage(text) {
    this.conversation.sendUserMessage(text);
  }
  handleConnect(props, initialContext) {
    this.conversationId = props.conversationId;
    console.log("[ElevenLabs] Connected:", this.conversationId);
    this.sessionStartTime = Date.now();
    this.uiAdapter.startSession();
    setTimeout(() => this.sendContextualUpdate(JSON.stringify(initialContext)), 0);
  }
  handleDisconnect(details) {
    console.log("[ElevenLabs] Disconnected:", details);
    this.uiAdapter.sendStateChange("disconnected");
    this.saveSessionMetadata(details);
  }
  handleError(message, context) {
    console.error("[ElevenLabs] Error:", message, context);
    this.appendConversationLog({ type: "debug", payload: { message, context } });
  }
  async handleClientToolCall(params) {
    const { tool_name, tool_call_id, parameters } = params;
    console.log("[Tool Call]", tool_name, parameters);
    try {
      let result;
      if (this.toolRegistry.isLocalTool(tool_name)) {
        result = await chrome.runtime.sendMessage({ type: "EXECUTE_TOOL", toolName: tool_name, parameters });
      } else if (this.toolRegistry.isOwnerTool(tool_name)) {
        result = await this.toolRegistry.executeOwnerTool(tool_name, parameters);
      } else {
        throw new Error(`Unknown tool: ${tool_name}`);
      }
      const text = JSON.stringify({ toolCallId: tool_call_id, result: JSON.stringify(result) });
      this.conversation.sendContextualUpdate(text);
    } catch (error) {
      console.error("[Tool Error]", error);
      const text = JSON.stringify({
        toolCallId: tool_call_id,
        result: JSON.stringify({ error: String(error) }),
        isError: true
      });
      this.conversation.sendContextualUpdate(text);
    }
  }
  handleConversationMetadata(props) {
    console.log("[Metadata]", props);
    this.appendConversationLog({ type: "conversation_metadata", payload: props });
  }
  /* Debug purpose */
  handleVadScore(props) {
    console.log("[VAD Score]", props.vadScore);
  }
  handleDebug(props) {
    console.log("[Debug]", props);
    this.appendConversationLog({ type: "debug", payload: props });
  }
  handleMCPConnectionStatus(props) {
    if (!this.conversationId)
      return;
    console.log("[MCP Connection Status]", props);
    this.appendConversationLog({ type: "mcp_connection_status", payload: props });
  }
  handleAgentToolRequest(event) {
    if (!this.conversationId)
      return;
    console.log("[Agent Tool Request]", event);
    this.appendConversationLog({ type: "agent_tool_request", payload: event });
  }
  handleAgentToolResponse(event) {
    if (!this.conversationId)
      return;
    console.log("[Agent Tool Response]", event);
    this.appendConversationLog({ type: "agent_tool_response", payload: event });
  }
  handleAsrInitiationMetadata(props) {
    if (!this.conversationId)
      return;
    console.log("[ASR Initiation Metadata]", props);
    this.appendConversationLog({ type: "asr_initiation_metadata", payload: props });
  }
  async endConversation() {
    try {
      await this.conversation.endSession();
      this.audioManager.close();
      console.log(`Conversation ended for tab ${this.tab.id}`);
    } catch (error) {
      console.error(`Failed to end conversation for tab ${this.tab.id}:`, error);
    }
  }
  /* Helper methods */
  async saveSessionMetadata(disconnectDetails) {
    await this.appendConversationLog({ type: "disconnect", props: disconnectDetails });
  }
  async appendConversationLog(entry) {
    const key = `conversation:${this.conversationId}`;
    const conversationLogs = (await chrome.storage.local.get(key))[key] ?? {};
    conversationLogs[String(Date.now())] = entry;
    await chrome.storage.local.set({ [key]: conversationLogs });
  }
}
export {
  ConversationManager
};
