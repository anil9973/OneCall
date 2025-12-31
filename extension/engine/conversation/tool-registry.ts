import { BACKEND_URL } from "../../shared/constants.js";
import { AgentToolName } from "../../shared/protocol.js";

interface OwnerToolConfig {
	name: string;
	type: "webhook" | "mcp";
	url?: string;
	mcpServer?: string;
	parameters: any;
}

export class ToolRegistry {
	private localTools = new Set([
		AgentToolName.GET_PAGE_CONTEXT,
		AgentToolName.GET_ALL_LINKS,
		AgentToolName.NAVIGATE_TO_URL,

		AgentToolName.GET_INTERACTIVE_ELEMENTS,
		AgentToolName.HIGHLIGHT_ELEMENT,
		AgentToolName.CLICK_ELEMENT,
		AgentToolName.FILL_INPUT_FIELD,
		AgentToolName.SELECT_DROPDOWN_OPTION,
		AgentToolName.SCROLL_PAGE,

		AgentToolName.TAKE_SCREENSHOT,
		AgentToolName.START_SCREEN_RECORDING,
		AgentToolName.START_ELEMENT_SELECTOR,

		AgentToolName.REQUEST_USER_INPUT,
		AgentToolName.DISPLAY_IVR_OPTIONS,

		AgentToolName.KNOWLEDGE_BASE_SEARCH,
		AgentToolName.CHECK_AUTHENTICATION,

		AgentToolName.ESCALATE_TO_HUMAN,
		AgentToolName.REPORT_ERROR,
		AgentToolName.CHECK_OWNER_AVAILABILITY,
		AgentToolName.DRAFT_EMAIL,

		AgentToolName.BRING_TAB_TO_FRONT,
		AgentToolName.FIND_TEXT_PATTERN,
		AgentToolName.GET_PAGE_METADATA,
		AgentToolName.EXTRACT_STRUCTURED_DATA,
	]);

	private ownerTools = new Map<string, OwnerToolConfig>();
	private currentDomain: string = "";
	private tabId: number;

	constructor(tabId: number) {
		this.tabId = tabId;
	}

	async getToolsConfig(url: string) {
		// 1. Load Local Tools (Static Definition)
		const localTools = this.getLocalToolDefinitions();

		// 2. Load Owner Tools (Dynamic Definition from Backend)
		/* const domain = new URL(url).hostname;
		try {
			await this.toolRegistry.loadOwnerTools(domain);
		} catch (e) {
			console.error("Failed to load owner tools", e);
		}

		const ownerTools: Record<string, any> = {};
		this.toolRegistry.getAllOwnerTools().forEach((_, name) => {
			// Create a proxy function for every owner tool
			ownerTools[name] = async (params: any) => this.executeOwnerTool(name, params);
		}); */

		// 3. Merge
		// return { ...localTools, ...ownerTools };
		return localTools;
	}

	async loadOwnerTools(domain: string) {
		this.currentDomain = domain;

		try {
			const headers = { Authorization: `Bearer ${await this.getAuthToken()}` };
			const response = await fetch(`${BACKEND_URL}/tools/${domain}`, { headers });

			if (response.ok) {
				const tools: OwnerToolConfig[] = await response.json();
				tools.forEach((tool) => this.ownerTools.set(tool.name, tool));
			}
		} catch (error) {
			console.error("Failed to load owner tools:", error);
			throw error;
		}
	}

	// Move the massive list here to keep main class clean
	private getLocalToolDefinitions() {
		/**
		 * List of agent tools supported locally in the content script.
		 * These names must exactly match ElevenLabs agent tool calls.
		 */
		const supportedAgentTools: AgentToolName[] = [
			// Navigation
			AgentToolName.GET_PAGE_CONTEXT,
			AgentToolName.GET_ALL_LINKS,
			AgentToolName.NAVIGATE_TO_URL,

			// Interaction
			AgentToolName.GET_INTERACTIVE_ELEMENTS,
			AgentToolName.HIGHLIGHT_ELEMENT,
			AgentToolName.CLICK_ELEMENT,
			AgentToolName.FILL_INPUT_FIELD,
			AgentToolName.SELECT_DROPDOWN_OPTION,
			AgentToolName.SCROLL_PAGE,
			// Tab
			AgentToolName.FIND_TEXT_PATTERN,
			AgentToolName.GET_PAGE_METADATA,
			AgentToolName.EXTRACT_STRUCTURED_DATA,

			// Visual
			AgentToolName.TAKE_SCREENSHOT,
			AgentToolName.START_SCREEN_RECORDING,
			AgentToolName.START_ELEMENT_SELECTOR,

			// UI
			AgentToolName.REQUEST_USER_INPUT,
			AgentToolName.DISPLAY_IVR_OPTIONS,

			// Knowledge
			AgentToolName.KNOWLEDGE_BASE_SEARCH,
			AgentToolName.CHECK_AUTHENTICATION,

			// Escalation
			AgentToolName.ESCALATE_TO_HUMAN,
			AgentToolName.REPORT_ERROR,
			AgentToolName.CHECK_OWNER_AVAILABILITY,
			AgentToolName.DRAFT_EMAIL,
		];

		/** * ElevenLabs tool definition object. Keys must be strings; values must be async functions. */
		const definitions: Record<AgentToolName, (params: any) => Promise<any>> = Object.create(null);

		for (const toolName of supportedAgentTools) {
			definitions[toolName] = async (parameters: any) => this.executeLocalTool(toolName, parameters);
		}

		return definitions;
	}

	getAllOwnerTools() {
		return this.ownerTools;
	}

	isLocalTool(toolName: AgentToolName): boolean {
		return this.localTools.has(toolName);
	}

	isOwnerTool(toolName: string): boolean {
		return this.ownerTools.has(toolName);
	}

	async executeLocalTool(toolName: string, parameters: any) {
		console.log(`🛠️ toolName:${toolName} called with parameters: ${JSON.stringify(parameters)}`);
		return await chrome.tabs.sendMessage(this.tabId, { type: "EXECUTE_TOOL", toolName, parameters });
	}

	async executeOwnerTool(toolName: string, parameters: any): Promise<any> {
		const tool = this.ownerTools.get(toolName);
		if (!tool) throw new Error(`Unknown tool: ${toolName}`);
		const authToken = await this.getAuthToken();
		// All owner tools proxied through backend for security
		const response = await fetch(`${BACKEND_URL}/proxy/tool`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${authToken}`,
			},
			body: JSON.stringify({
				domain: this.currentDomain,
				toolName,
				toolConfig: tool,
				parameters,
			}),
		});

		if (!response.ok) throw new Error(`Tool execution failed: ${response.statusText}`);

		return await response.json();
	}

	async getAuthToken() {
		return (await chrome.storage.local.get("authToken")).authToken;
	}

	/* private async executeToolSafely(toolName: string, parameters?: any): Promise<string> {
		try {
			const result = await chrome.runtime.sendMessage({
				type: "FORWARD_TO_TAB",
				tabId: this.tabId,
				tabMessage: { type: toolName, parameters },
			});

			if (result?.error) {
				await this.appendConversationLog(this.conversationId!, {
					type: "local_tool_error",
					tool: type,
					error: result.error,
				});
				return JSON.stringify({ success: false, error: result.error });
			}

			return JSON.stringify({ success: true, result: result?.result ?? result });
		} catch (err) {
			const errorMessage = String(err);
			await this.appendConversationLog(this.conversationId!, {
				type: "local_tool_exception",
				tool: type,
				error: errorMessage,
			});
			return JSON.stringify({ success: false, error: errorMessage });
		}
	} */
}
