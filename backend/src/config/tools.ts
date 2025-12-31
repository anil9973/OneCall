import type { ToolConfig } from "../types/index.ts";

/** Core navigation tools */
export class NavigationTools {
	static getPageContext(): ToolConfig {
		return {
			type: "client",
			name: "get_page_context",
			description:
				"Get current page URL, title, description, headings, and first paragraph. Call at conversation start and after navigation.",
			responseTimeoutSecs: 10,
			disableInterruptions: false,
			forcePreToolSpeech: false,
		};
	}

	static getAllLinks(): ToolConfig {
		return {
			type: "client",
			name: "get_all_links",
			description:
				"Get all clickable links on the page with text context. Use when user requests navigation but destination is ambiguous.",
			parameters: [
				{
					name: "filterText",
					type: "string",
					description: "Optional: Filter links by text content",
					required: false,
				},
			],
			responseTimeoutSecs: 10,
		};
	}

	static navigateToUrl(): ToolConfig {
		return {
			type: "client",
			name: "navigate_to_url",
			description: "Navigate to a specific URL. Only use when you know the exact URL.",
			parameters: [
				{ name: "url", type: "string", description: "Full URL including protocol (https://)", required: true },
				{ name: "waitForLoad", type: "boolean", description: "Wait for page to fully load", required: false },
			],
			responseTimeoutSecs: 15,
			forcePreToolSpeech: true,
		};
	}
}

/** Element interaction tools */
export class InteractionTools {
	static getInteractiveElements(): ToolConfig {
		return {
			type: "client",
			name: "get_interactive_elements",
			description:
				"Get all interactive elements (buttons, inputs, links) on the page. Returns element IDs, text, and context.",
			parameters: [
				{
					name: "type",
					type: "string",
					description: "Element type: button, input, select, link, or all",
					required: false,
					enum: ["button", "input", "select", "link", "all"],
				},
				{ name: "filterText", type: "string", description: "Filter by visible text", required: false },
			],
			responseTimeoutSecs: 10,
		};
	}

	static highlightElement(): ToolConfig {
		return {
			type: "client",
			name: "highlight_element",
			description: "Highlight an element on the page before interacting with it. Shows user what you will click.",
			parameters: [
				{
					name: "elementId",
					type: "string",
					description: "Element ID from get_interactive_elements",
					required: true,
				},
				{
					name: "duration",
					type: "number",
					description: "Duration in milliseconds (default: 3000)",
					required: false,
				},
				{ name: "message", type: "string", description: "Message to show user", required: false },
			],
			responseTimeoutSecs: 5,
			forcePreToolSpeech: true,
		};
	}

	static clickElement(): ToolConfig {
		return {
			type: "client",
			name: "click_element",
			description: "Click a button, link, or other interactive element. Always highlight first before clicking.",
			parameters: [
				{
					name: "elementId",
					type: "string",
					description: "Element ID from get_interactive_elements",
					required: true,
				},
				{
					name: "requireConfirmation",
					type: "boolean",
					description: "Require user confirmation before clicking",
					required: false,
				},
			],
			responseTimeoutSecs: 10,
			forcePreToolSpeech: true,
		};
	}

	static fillInputField(): ToolConfig {
		return {
			type: "client",
			name: "fill_input_field",
			description: "Fill a text input or textarea with provided value.",
			parameters: [
				{ name: "elementId", type: "string", description: "Input element ID", required: true },
				{ name: "value", type: "string", description: "Value to enter", required: true },
				{
					name: "triggerEvents",
					type: "boolean",
					description: "Trigger onChange events (default: true)",
					required: false,
				},
			],
			responseTimeoutSecs: 5,
		};
	}

	static selectDropdownOption(): ToolConfig {
		return {
			type: "client",
			name: "select_dropdown_option",
			description: "Select an option from a dropdown/select element.",
			parameters: [
				{ name: "elementId", type: "string", description: "Select element ID", required: true },
				{ name: "optionValue", type: "string", description: "Option value to select", required: false },
				{ name: "optionText", type: "string", description: "Option text to select (alternative)", required: false },
			],
			responseTimeoutSecs: 5,
		};
	}

	static scrollPage(): ToolConfig {
		return {
			type: "client",
			name: "scroll_page",
			description: "Scroll the page to make content visible.",
			parameters: [
				{
					name: "direction",
					type: "string",
					description: "Scroll direction",
					required: true,
					enum: ["up", "down", "to_element"],
				},
				{
					name: "elementId",
					type: "string",
					description: "Element to scroll to (if direction is to_element)",
					required: false,
				},
				{
					name: "amount",
					type: "number",
					description: "Pixels to scroll (if direction is up/down)",
					required: false,
				},
			],
			responseTimeoutSecs: 5,
		};
	}
}

/** Visual & debugging tools */
export class VisualTools {
	static takeScreenshot(): ToolConfig {
		return {
			type: "client",
			name: "take_screenshot",
			description: "Capture a screenshot of the current page. Useful for debugging or escalation.",
			parameters: [
				{ name: "includeAnnotations", type: "boolean", description: "Include visual annotations", required: false },
				{
					name: "highlightElement",
					type: "string",
					description: "Element ID to highlight in screenshot",
					required: false,
				},
			],
			responseTimeoutSecs: 10,
		};
	}

	static startScreenRecording(): ToolConfig {
		return {
			type: "client",
			name: "start_screen_recording",
			description: 'Start recording the screen. Use when user says "let me show you the problem".',
			parameters: [
				{ name: "includeAudio", type: "boolean", description: "Include microphone audio", required: false },
				{ name: "maxDuration", type: "number", description: "Max recording duration in seconds", required: false },
			],
			responseTimeoutSecs: 5,
		};
	}

	static startElementSelector(): ToolConfig {
		return {
			type: "client",
			name: "start_element_selector",
			description:
				"Let user visually select an element by clicking on it. Use when AI cannot determine which element user means.",
			parameters: [
				{ name: "message", type: "string", description: "Instruction message to show user", required: true },
				{ name: "elementType", type: "string", description: "Expected element type (optional)", required: false },
			],
			responseTimeoutSecs: 30,
			forcePreToolSpeech: true,
		};
	}
}

/** UI state management tools */
export class UITools {
	static updateUIState(): ToolConfig {
		return {
			type: "client",
			name: "update_ui_state",
			description: "Control the OneCall widget UI. Use to expand transcript, show IVR options, etc.",
			parameters: [
				{
					name: "action",
					type: "string",
					description: "UI action to perform",
					required: true,
					enum: ["expand_transcript", "collapse_transcript", "show_ivr", "hide_ivr"],
				},
				{ name: "data", type: "object", description: "Action-specific data", required: false, properties: {} },
			],
			responseTimeoutSecs: 2,
		};
	}

	static requestUserInput(): ToolConfig {
		return {
			type: "client",
			name: "request_user_input",
			description: "Request specific data from user via input field (OTP, Order ID, etc).",
			parameters: [
				{ name: "type", type: "string", description: "Input type", required: true, enum: ["text", "number", "otp"] },
				{ name: "label", type: "string", description: "Input label text", required: true },
				{ name: "placeholder", type: "string", description: "Placeholder text", required: false },
				{ name: "validation", type: "string", description: "Regex validation pattern", required: false },
			],
			responseTimeoutSecs: 60,
			forcePreToolSpeech: true,
		};
	}
}

/** Knowledge & search tools */
export class KnowledgeTools {
	static knowledgeBaseSearch(): ToolConfig {
		return {
			type: "client",
			name: "knowledge_base_search",
			description: "Search site documentation, FAQs, help pages for policy information.",
			parameters: [
				{ name: "query", type: "string", description: "Search query", required: true },
				{
					name: "domains",
					type: "array",
					description: "Specific domains to search (help, support, faq)",
					required: false,
				},
			],
			responseTimeoutSecs: 15,
		};
	}

	static checkAuthentication(): ToolConfig {
		return {
			type: "client",
			name: "check_authentication",
			description: "Check if user is logged in to the website.",
			responseTimeoutSecs: 5,
		};
	}
}

/** Escalation & support tools */
export class EscalationTools {
	static escalateToHuman(): ToolConfig {
		return {
			type: "client",
			name: "escalate_to_human",
			description:
				"Escalate to human support. Use when unable to solve user issue or user explicitly requests human agent.",
			parameters: [
				{
					name: "reason",
					type: "string",
					description: "Escalation reason",
					required: true,
					enum: ["user_request", "unable_to_solve", "error"],
				},
				{ name: "summary", type: "string", description: "Brief summary of the issue", required: true },
				{ name: "attachScreenshot", type: "boolean", description: "Include screenshot", required: false },
				{ name: "attachRecording", type: "boolean", description: "Include screen recording", required: false },
			],
			responseTimeoutSecs: 10,
			forcePreToolSpeech: true,
		};
	}

	static reportError(): ToolConfig {
		return {
			type: "client",
			name: "report_error",
			description: "Report an error to the user when an action fails.",
			parameters: [
				{
					name: "errorType",
					type: "string",
					description: "Type of error",
					required: true,
					enum: ["element_not_found", "network_error", "permission_denied", "timeout"],
				},
				{ name: "message", type: "string", description: "Error message to user", required: true },
				{
					name: "suggestedAction",
					type: "string",
					description: "Suggested next step",
					required: false,
					enum: ["try_scroll", "ask_user", "escalate", "retry"],
				},
			],
			responseTimeoutSecs: 5,
		};
	}
}

/** Tab management tools */
export class TabTools {
	static bringTabToFront(): ToolConfig {
		return {
			type: "client",
			name: "bring_tab_to_front",
			description: "Bring the conversation tab back to focus if user switched tabs.",
			responseTimeoutSecs: 2,
		};
	}

	static findTextPattern(): ToolConfig {
		return {
			type: "client",
			name: "find_text_pattern",
			description: "Find text matching a pattern (regex, startsWith, endsWith, contains).",
			parameters: [
				{ name: "pattern", type: "string", description: "Text pattern to find", required: true },
				{
					name: "mode",
					type: "string",
					description: "Match mode",
					required: true,
					enum: ["regex", "startsWith", "endsWith", "contains", "exact"],
				},
			],
			responseTimeoutSecs: 10,
		};
	}
}

/** Get all tool definitions */
export function getAllToolDefinitions(): ToolConfig[] {
	return [
		// Navigation
		...Object.values(NavigationTools).map((fn) => fn()),

		// Interaction
		...Object.values(InteractionTools).map((fn) => fn()),

		// Visual
		...Object.values(VisualTools).map((fn) => fn()),

		// UI
		...Object.values(UITools).map((fn) => fn()),

		// Knowledge
		...Object.values(KnowledgeTools).map((fn) => fn()),

		// Escalation
		...Object.values(EscalationTools).map((fn) => fn()),

		// Tab management
		...Object.values(TabTools).map((fn) => fn()),
	];
}
