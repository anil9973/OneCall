import { DOMExtractor } from "../tools/dom-extractor.js";
import { NavigationTools } from "../tools/navigation.js";
import { InteractionTools } from "../tools/interaction.js";
import { AgentToolName } from "../../../shared/protocol.js";
import { KnowledgeTools } from "../tools/knowledge.js";
import { EscalationTools } from "../tools/escalation.js";
import { VisualTools } from "../tools/visual.js";
import { TabTools } from "../tools/tab.js";
import { UITools } from "../tools/ui.js";

export class ToolManager {
	domExtractor = new DOMExtractor();
	navigationTools = new NavigationTools(this.domExtractor);
	interactionTools = new InteractionTools(this.domExtractor);
	visualTools = new VisualTools();
	uiTools = new UITools();
	knowledgeTools = new KnowledgeTools();
	escalationTools = new EscalationTools();
	tabTools = new TabTools();

	constructor() {}

	toolMap = {
		// GET
		[AgentToolName.GET_PAGE_CONTEXT]: () => this.navigationTools.getPageContext(),

		[AgentToolName.GET_ALL_LINKS]: (params: any) => this.navigationTools.getAllLinks(params),

		[AgentToolName.NAVIGATE_TO_URL]: (params: any) => this.navigationTools.navigateToUrl(params),

		[AgentToolName.EXTRACT_STRUCTURED_DATA]: () => this.tabTools.extractStructuredData(),

		[AgentToolName.GET_INTERACTIVE_ELEMENTS]: (params: any) => this.interactionTools.getInteractiveElements(params),

		[AgentToolName.FIND_TEXT_PATTERN]: (params: any) => this.tabTools.findTextPattern(params),

		[AgentToolName.GET_PAGE_METADATA]: () => this.tabTools.getPageMetadata(),
		// DOM Interaction
		[AgentToolName.HIGHLIGHT_ELEMENT]: (params: any) => this.interactionTools.highlightElement(params),

		[AgentToolName.CLICK_ELEMENT]: (params: any) => this.interactionTools.clickElement(params),

		[AgentToolName.FILL_INPUT_FIELD]: (params: any) => this.interactionTools.fillInputField(params),

		[AgentToolName.SELECT_DROPDOWN_OPTION]: (params: any) => this.interactionTools.selectDropdownOption(params),

		[AgentToolName.SCROLL_PAGE]: (params: any) => this.interactionTools.scrollPage(params),

		[AgentToolName.TAKE_SCREENSHOT]: (params: any) => this.visualTools.takeScreenshot(params),

		[AgentToolName.START_SCREEN_RECORDING]: (params: any) => this.visualTools.startScreenRecording(params),

		[AgentToolName.START_ELEMENT_SELECTOR]: (params: any) => this.visualTools.startElementSelector(params),

		[AgentToolName.REQUEST_USER_INPUT]: (params: any) => this.uiTools.requestUserInput(params),

		[AgentToolName.DISPLAY_IVR_OPTIONS]: (params: any) => this.uiTools.displayIVROptions(params),

		[AgentToolName.KNOWLEDGE_BASE_SEARCH]: (params: any) => this.knowledgeTools.knowledgeBaseSearch(params),

		[AgentToolName.CHECK_AUTHENTICATION]: () => this.knowledgeTools.checkAuthentication(),

		[AgentToolName.REPORT_ERROR]: (params: any) => this.escalationTools.reportError(params),

		[AgentToolName.CHECK_OWNER_AVAILABILITY]: () => this.escalationTools.checkOwnerAvailability(),

		[AgentToolName.DRAFT_EMAIL]: (params: any) => this.escalationTools.draftEmail(params),

		[AgentToolName.BRING_TAB_TO_FRONT]: () => this.tabTools.bringTabToFront(),

		[AgentToolName.ESCALATE_TO_HUMAN]: (params: any) => this.escalationTools.escalateToHuman(params),
	};

	async executeTool(toolName: string, params: any) {
		const tool = this.toolMap[toolName as keyof typeof this.toolMap];
		if (tool) return await tool(params);
	}
}
