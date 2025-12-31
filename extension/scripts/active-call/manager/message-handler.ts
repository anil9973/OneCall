import { EngineToWidgetAction, EngineToWidgetToolAction } from "../../../shared/protocol.js";
import type { CallWidgetManager } from "./ActiveCallManager.js";

export class MessageHandler {
	private cwm: CallWidgetManager;

	constructor(callWidgetManager: CallWidgetManager) {
		this.cwm = callWidgetManager;
	}

	handlers = {
		// Navigation tools (Agent → Service Worker → Content)
		[EngineToWidgetToolAction.GET_PAGE_CONTEXT]: async () => this.cwm.navigationTools.getPageContext(),

		[EngineToWidgetToolAction.GET_ALL_LINKS]: async (message: any) =>
			this.cwm.navigationTools.getAllLinks(message.parameters),

		[EngineToWidgetToolAction.NAVIGATE_TO_URL]: async (message: any) =>
			this.cwm.navigationTools.navigateToUrl(message.parameters),

		// Interaction tools
		[EngineToWidgetToolAction.GET_INTERACTIVE_ELEMENTS]: async (message: any) =>
			this.cwm.interactionTools.getInteractiveElements(message.parameters),

		[EngineToWidgetToolAction.HIGHLIGHT_ELEMENT]: async (message: any) =>
			this.cwm.interactionTools.highlightElement(message.parameters),

		[EngineToWidgetToolAction.CLICK_ELEMENT]: async (message: any) =>
			this.cwm.interactionTools.clickElement(message.parameters),

		[EngineToWidgetToolAction.FILL_INPUT_FIELD]: async (message: any) =>
			this.cwm.interactionTools.fillInputField(message.parameters),

		[EngineToWidgetToolAction.SELECT_DROPDOWN_OPTION]: async (message: any) =>
			this.cwm.interactionTools.selectDropdownOption(message.parameters),

		[EngineToWidgetToolAction.SCROLL_PAGE]: async (message: any) =>
			this.cwm.interactionTools.scrollPage(message.parameters),

		// Visual tools
		[EngineToWidgetToolAction.TAKE_SCREENSHOT]: async (message: any) =>
			this.cwm.visualTools.takeScreenshot(message.parameters),

		[EngineToWidgetToolAction.START_SCREEN_RECORDING]: async (message: any) =>
			this.cwm.visualTools.startScreenRecording(message.parameters),

		[EngineToWidgetToolAction.START_ELEMENT_SELECTOR]: async (message: any) =>
			this.cwm.visualTools.startElementSelector(message.parameters),

		[EngineToWidgetToolAction.STOP_RECORDING]: async () => {
			this.cwm.visualTools.stopRecording();
			return { success: true };
		},

		// UI tools
		[EngineToWidgetToolAction.UPDATE_UI_STATE]: async (message: any) =>
			this.cwm.uiTools.updateUIState(message.parameters),

		[EngineToWidgetToolAction.REQUEST_USER_INPUT]: async (message: any) =>
			this.cwm.uiTools.requestUserInput(message.parameters),

		[EngineToWidgetToolAction.DISPLAY_IVR_OPTIONS]: async (message: any) =>
			this.cwm.uiTools.displayIVROptions(message.parameters),

		[EngineToWidgetToolAction.ADD_TRANSCRIPT_MESSAGE]: async (message: any) =>
			this.cwm.uiTools.addTranscriptMessage(message.parameters),

		// Knowledge tools
		[EngineToWidgetToolAction.KNOWLEDGE_BASE_SEARCH]: async (message: any) =>
			this.cwm.knowledgeTools.knowledgeBaseSearch(message.parameters),

		[EngineToWidgetToolAction.CHECK_AUTHENTICATION]: async () => this.cwm.knowledgeTools.checkAuthentication(),

		// Escalation tools
		[EngineToWidgetToolAction.ESCALATE_TO_HUMAN]: async (message: any) =>
			this.cwm.escalationTools.escalateToHuman(message.parameters),

		[EngineToWidgetToolAction.REPORT_ERROR]: async (message: any) =>
			this.cwm.escalationTools.reportError(message.parameters),

		[EngineToWidgetToolAction.CHECK_OWNER_AVAILABILITY]: async () =>
			this.cwm.escalationTools.checkOwnerAvailability(),

		[EngineToWidgetToolAction.DRAFT_EMAIL]: async (message: any) =>
			this.cwm.escalationTools.draftEmail(message.parameters),

		// Tab tools
		[EngineToWidgetToolAction.BRING_TAB_TO_FRONT]: async () => this.cwm.tabTools.bringTabToFront(),

		[EngineToWidgetToolAction.FIND_TEXT_PATTERN]: async (message: any) =>
			this.cwm.tabTools.findTextPattern(message.parameters),

		[EngineToWidgetToolAction.GET_PAGE_METADATA]: async () => this.cwm.tabTools.getPageMetadata(),

		[EngineToWidgetToolAction.EXTRACT_STRUCTURED_DATA]: async () => this.cwm.tabTools.extractStructuredData(),

		[EngineToWidgetToolAction.CLEAR_HIGHLIGHTS]: async () => this.cwm.tabTools.clearHighlights(),

		// Control / Widget management (NOT agent tools)
		[EngineToWidgetAction.EXECUTE_TOOL]: async (message: any) =>
			this.cwm.executeTool(message.toolName, message.parameters),

		[EngineToWidgetAction.SHOW_WIDGET]: async () => this.cwm.showWidget(),

		[EngineToWidgetAction.HIDE_WIDGET]: async () => this.cwm.hideWidget(),

		[EngineToWidgetAction.TOGGLE_WIDGET]: async () => this.cwm.toggleWidget(),
	};

	handleMessage(message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) {
		console.log(message);
		const handler = this.handlers[message.type as keyof typeof this.handlers];
		if (handler) {
			handler(message)
				.then(sendResponse)
				.catch((err) => sendResponse({ success: false, error: String(err) }));
			return true; // Keep channel open for async response
		}
	}
}
