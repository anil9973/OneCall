import { BACKEND_URL } from "../../shared/constants.js";
import { AgentToolName } from "../../shared/protocol.js";
class ToolRegistry {
  localTools = /* @__PURE__ */ new Set([
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
    AgentToolName.EXTRACT_STRUCTURED_DATA
  ]);
  ownerTools = /* @__PURE__ */ new Map();
  currentDomain = "";
  tabId;
  constructor(tabId) {
    this.tabId = tabId;
  }
  async getToolsConfig(url) {
    const localTools = this.getLocalToolDefinitions();
    return localTools;
  }
  async loadOwnerTools(domain) {
    this.currentDomain = domain;
    try {
      const headers = { Authorization: `Bearer ${await this.getAuthToken()}` };
      const response = await fetch(`${BACKEND_URL}/tools/${domain}`, { headers });
      if (response.ok) {
        const tools = await response.json();
        tools.forEach((tool) => this.ownerTools.set(tool.name, tool));
      }
    } catch (error) {
      console.error("Failed to load owner tools:", error);
      throw error;
    }
  }
  // Move the massive list here to keep main class clean
  getLocalToolDefinitions() {
    const supportedAgentTools = [
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
      AgentToolName.DRAFT_EMAIL
    ];
    const definitions = /* @__PURE__ */ Object.create(null);
    for (const toolName of supportedAgentTools) {
      definitions[toolName] = async (parameters) => this.executeLocalTool(toolName, parameters);
    }
    return definitions;
  }
  getAllOwnerTools() {
    return this.ownerTools;
  }
  isLocalTool(toolName) {
    return this.localTools.has(toolName);
  }
  isOwnerTool(toolName) {
    return this.ownerTools.has(toolName);
  }
  async executeLocalTool(toolName, parameters) {
    console.log(`\u{1F6E0}\uFE0F toolName:${toolName} called with parameters: ${JSON.stringify(parameters)}`);
    return await chrome.tabs.sendMessage(this.tabId, { type: "EXECUTE_TOOL", toolName, parameters });
  }
  async executeOwnerTool(toolName, parameters) {
    const tool = this.ownerTools.get(toolName);
    if (!tool)
      throw new Error(`Unknown tool: ${toolName}`);
    const authToken = await this.getAuthToken();
    const response = await fetch(`${BACKEND_URL}/proxy/tool`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        domain: this.currentDomain,
        toolName,
        toolConfig: tool,
        parameters
      })
    });
    if (!response.ok)
      throw new Error(`Tool execution failed: ${response.statusText}`);
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
export {
  ToolRegistry
};
