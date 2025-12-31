import { WidgetToEngineAction } from "../../../shared/protocol.js";
import { ActiveCallWidget } from "../components/onecall-widget.js";
import { MessageHandler } from "./message-handler.js";
import { ToolManager } from "./ToolManager.js";

export class CallWidgetManager extends ToolManager {
	private activeCallWidget!: ActiveCallWidget;
	constructor() {
		super();
		this.setupEventListeners();
		this.injectWidget();
		console.log("[OneCall] ActiveCallManager injected");
	}

	/** Setup event listeners for widget interactions */
	private setupEventListeners() {
		// Listen for widget events
		/* document.addEventListener("onecall:call-start", this.handleCallStart.bind(this));
		document.addEventListener("onecall:call-end", this.handleCallEnd.bind(this));
		document.addEventListener("onecall:ivr-selection", this.handleIVRSelection.bind(this));
		document.addEventListener("onecall:user-input-submit", this.handleUserInputSubmit.bind(this)); */
		// Listen for page visibility changes
		/* document.addEventListener("visibilitychange", () => {
			document.hidden || this.updateWidgetPageContext();
		}); */
		// Listen for URL changes (SPA navigation)
		/* let lastUrl = location.href;
		new MutationObserver(() => {
			const url = location.href;
			if (url !== lastUrl) {
				lastUrl = url;
				this.updateWidgetPageContext();
			}
		}).observe(document, { subtree: true, childList: true }); */
	}

	/** Inject OneCall widget */
	private injectWidget() {
		if (this.activeCallWidget) return;
		this.activeCallWidget = new ActiveCallWidget();
		document.body.appendChild(this.activeCallWidget);
		console.log("[OneCall] Widget injected successfully");
	}

	/** Handle call start event */
	private async handleCallStart(event: CustomEvent) {
		await chrome.runtime.sendMessage({ type: WidgetToEngineAction.CALL_STARTED, data: event.detail });
		console.log("[OneCall] Call started", event.detail);
	}

	/** Handle call end event */
	private async handleCallEnd(event: CustomEvent) {
		await chrome.runtime.sendMessage({ type: WidgetToEngineAction.CALL_ENDED, data: event.detail });
		console.log("[OneCall] Call ended", event.detail);
	}

	// /** Handle IVR selection event */
	// private handleIVRSelection(event: CustomEvent) {
	// 	chrome.runtime.sendMessage({ type: "IVR_SELECTED", data: event.detail });
	// 	console.log("[OneCall] IVR selected", event.detail);
	// }

	// /** Handle user input submit event */
	// private handleUserInputSubmit(event: CustomEvent) {
	// 	chrome.runtime.sendMessage({ type: "USER_INPUT_SUBMITTED", data: event.detail });
	// 	console.log("[OneCall] User input submitted", event.detail);
	// }

	// /** Update widget with current page context */
	// private async updateWidgetPageContext() {
	// 	const widget = document.getElementById("onecall-widget") as any;
	// 	widget?.state && (widget.state.currentPage = `${document.title} - ${window.location.pathname}`);
	// }

	/** Show widget */
	private showWidget() {
		this.activeCallWidget.showPopover();
	}

	/** Hide widget */
	private hideWidget() {
		this.activeCallWidget.hidePopover();
	}

	/** Toggle widget */
	private toggleWidget() {
		this.activeCallWidget.togglePopover();
	}
}

const activeManager = new CallWidgetManager();
const messgeHandler = new MessageHandler(activeManager);
chrome.runtime.onMessage.addListener(messgeHandler.handleMessage.bind(messgeHandler));
console.log("[CALL WIDGET MANAGER] initialized");
