import type { AgentConfig, WebsiteType } from "../types/index.ts";

/** Agent configuration per website type */
export class AgentRegistry {
	private readonly agents: Record<WebsiteType, AgentConfig>;

	constructor() {
		this.agents = {
			base: {
				id: process.env.AGENT_BASE_ID || "",
				name: "General Assistant",
				websiteType: "base",
				tools: [
					"get_page_context",
					"get_all_links",
					"navigate_to_url",
					"get_interactive_elements",
					"highlight_element",
					"click_element",
					"scroll_page",
					"escalate_to_human",
				],
			},

			shopping: {
				id: process.env.AGENT_SHOPPING_ID || "",
				name: "Shopping Assistant",
				websiteType: "shopping",
				tools: [
					"get_page_context",
					"navigate_to_url",
					"click_element",
					"get_order_list",
					"track_shipment",
					"add_to_cart",
					"apply_coupon",
					"find_product",
					"escalate_to_human",
				],
			},

			finance: {
				id: process.env.AGENT_FINANCE_ID || "",
				name: "Finance Assistant",
				websiteType: "finance",
				tools: [
					"get_page_context",
					"navigate_to_url",
					"check_authentication",
					"get_account_balance",
					"get_transactions",
					"transfer_funds",
					"pay_bill",
					"escalate_to_human",
				],
			},

			entertainment: {
				id: process.env.AGENT_ENTERTAINMENT_ID || "",
				name: "Entertainment Assistant",
				websiteType: "entertainment",
				tools: [
					"get_page_context",
					"navigate_to_url",
					"click_element",
					"play_video",
					"pause_video",
					"search_content",
					"add_to_playlist",
					"get_recommendations",
				],
			},

			learning: {
				id: process.env.AGENT_LEARNING_ID || "",
				name: "Learning Assistant",
				websiteType: "learning",
				tools: [
					"get_page_context",
					"navigate_to_url",
					"click_element",
					"get_course_progress",
					"submit_assignment",
					"take_quiz",
					"get_schedule",
					"join_class",
				],
			},

			programming: {
				id: process.env.AGENT_PROGRAMMING_ID || "",
				name: "Developer Assistant",
				websiteType: "programming",
				tools: [
					"get_page_context",
					"get_all_links",
					"navigate_to_url",
					"knowledge_base_search",
					"find_text_pattern",
					"take_screenshot",
					"copy_code_snippet",
				],
			},

			news: {
				id: process.env.AGENT_NEWS_ID || "",
				name: "News Assistant",
				websiteType: "news",
				tools: [
					"get_page_context",
					"navigate_to_url",
					"get_all_links",
					"scroll_page",
					"take_screenshot",
					"knowledge_base_search",
				],
			},

			research: {
				id: process.env.AGENT_RESEARCH_ID || "",
				name: "Research Assistant",
				websiteType: "research",
				tools: [
					"get_page_context",
					"navigate_to_url",
					"knowledge_base_search",
					"find_text_pattern",
					"take_screenshot",
					"get_all_links",
					"scroll_page",
				],
			},

			"social-media": {
				id: process.env.AGENT_SOCIAL_MEDIA_ID || "",
				name: "Social Media Assistant",
				websiteType: "social-media",
				tools: [
					"get_page_context",
					"navigate_to_url",
					"click_element",
					"fill_input_field",
					"scroll_page",
					"take_screenshot",
				],
			},

			productivity: {
				id: process.env.AGENT_PRODUCTIVITY_ID || "",
				name: "Productivity Assistant",
				websiteType: "productivity",
				tools: [
					"get_page_context",
					"navigate_to_url",
					"get_interactive_elements",
					"click_element",
					"fill_input_field",
					"select_dropdown_option",
					"create_task",
					"update_status",
				],
			},

			documentation: {
				id: process.env.AGENT_DOCUMENTATION_ID || "",
				name: "Documentation Assistant",
				websiteType: "documentation",
				tools: [
					"get_page_context",
					"get_all_links",
					"navigate_to_url",
					"knowledge_base_search",
					"find_text_pattern",
					"scroll_page",
					"take_screenshot",
				],
			},
		};
	}

	getAgent(type: WebsiteType): AgentConfig {
		return this.agents[type] ?? this.agents.base;
	}

	getAllAgents(): AgentConfig[] {
		return Object.values(this.agents);
	}
}
