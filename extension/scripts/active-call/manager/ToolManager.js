import { DOMExtractor } from "../tools/dom-extractor.js";
import { NavigationTools } from "../tools/navigation.js";
import { InteractionTools } from "../tools/interaction.js";
import { AgentToolName } from "../../../shared/protocol.js";
import { KnowledgeTools } from "../tools/knowledge.js";
import { EscalationTools } from "../tools/escalation.js";
import { VisualTools } from "../tools/visual.js";
import { TabTools } from "../tools/tab.js";
import { UITools } from "../tools/ui.js";
class ToolManager {
  domExtractor = new DOMExtractor();
  navigationTools = new NavigationTools(this.domExtractor);
  interactionTools = new InteractionTools(this.domExtractor);
  visualTools = new VisualTools();
  uiTools = new UITools();
  knowledgeTools = new KnowledgeTools();
  escalationTools = new EscalationTools();
  tabTools = new TabTools();
  constructor() {
  }
  toolMap = {
    // GET
    [AgentToolName.GET_PAGE_CONTEXT]: () => this.navigationTools.getPageContext(),
    [AgentToolName.GET_ALL_LINKS]: (params) => this.navigationTools.getAllLinks(params),
    [AgentToolName.NAVIGATE_TO_URL]: (params) => this.navigationTools.navigateToUrl(params),
    [AgentToolName.EXTRACT_STRUCTURED_DATA]: () => this.tabTools.extractStructuredData(),
    [AgentToolName.GET_INTERACTIVE_ELEMENTS]: (params) => this.interactionTools.getInteractiveElements(params),
    [AgentToolName.FIND_TEXT_PATTERN]: (params) => this.tabTools.findTextPattern(params),
    [AgentToolName.GET_PAGE_METADATA]: () => this.tabTools.getPageMetadata(),
    // DOM Interaction
    [AgentToolName.HIGHLIGHT_ELEMENT]: (params) => this.interactionTools.highlightElement(params),
    [AgentToolName.CLICK_ELEMENT]: (params) => this.interactionTools.clickElement(params),
    [AgentToolName.FILL_INPUT_FIELD]: (params) => this.interactionTools.fillInputField(params),
    [AgentToolName.SELECT_DROPDOWN_OPTION]: (params) => this.interactionTools.selectDropdownOption(params),
    [AgentToolName.SCROLL_PAGE]: (params) => this.interactionTools.scrollPage(params),
    [AgentToolName.TAKE_SCREENSHOT]: (params) => this.visualTools.takeScreenshot(params),
    [AgentToolName.START_SCREEN_RECORDING]: (params) => this.visualTools.startScreenRecording(params),
    [AgentToolName.START_ELEMENT_SELECTOR]: (params) => this.visualTools.startElementSelector(params),
    [AgentToolName.REQUEST_USER_INPUT]: (params) => this.uiTools.requestUserInput(params),
    [AgentToolName.DISPLAY_IVR_OPTIONS]: (params) => this.uiTools.displayIVROptions(params),
    [AgentToolName.KNOWLEDGE_BASE_SEARCH]: (params) => this.knowledgeTools.knowledgeBaseSearch(params),
    [AgentToolName.CHECK_AUTHENTICATION]: () => this.knowledgeTools.checkAuthentication(),
    [AgentToolName.REPORT_ERROR]: (params) => this.escalationTools.reportError(params),
    [AgentToolName.CHECK_OWNER_AVAILABILITY]: () => this.escalationTools.checkOwnerAvailability(),
    [AgentToolName.DRAFT_EMAIL]: (params) => this.escalationTools.draftEmail(params),
    [AgentToolName.BRING_TAB_TO_FRONT]: () => this.tabTools.bringTabToFront(),
    [AgentToolName.ESCALATE_TO_HUMAN]: (params) => this.escalationTools.escalateToHuman(params)
  };
  async executeTool(toolName, params) {
    const tool = this.toolMap[toolName];
    if (tool) return await tool(params);
  }
}
export {
  ToolManager
};
