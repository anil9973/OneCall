export class EscalationTools {
	/** Escalate conversation to human support */
	async escalateToHuman(params: { reason: string; priority?: "low" | "medium" | "high"; context?: string }) {
		const { reason, priority = "medium", context = "" } = params;

		try {
			// Send escalation request to background
			const response = await new Promise<any>((resolve) => {
				chrome.runtime.sendMessage(
					{
						type: "ESCALATE_TO_HUMAN",
						data: {
							reason,
							priority,
							context,
							url: window.location.href,
							timestamp: Date.now(),
						},
					},
					resolve
				);
			});

			if (response.success) {
				// Update UI to show escalation status
				const widget = document.getElementById("onecall-widget") as any;
				if (widget?.state) {
					widget.state.aiState = "thinking";
					widget.state.transcriptMessages?.push({
						id: `escalation_${Date.now()}`,
						role: "ai",
						content: response.ownerAvailable
							? "Connecting you to a human agent. Please hold..."
							: "Your request has been sent to support. They will contact you shortly.",
						timestamp: Date.now(),
					});
				}

				return {
					success: true,
					escalated: true,
					ownerAvailable: response.ownerAvailable,
					estimatedWaitTime: response.estimatedWaitTime || null,
				};
			}

			return response;
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	/** Report error to backend */
	async reportError(params: {
		errorType: "tool_failure" | "page_error" | "navigation_error" | "unknown";
		message: string;
		toolName?: string;
		stackTrace?: string;
	}) {
		const { errorType, message, toolName, stackTrace } = params;

		try {
			// Capture error context
			const errorContext = {
				type: errorType,
				message,
				toolName,
				stackTrace,
				url: window.location.href,
				timestamp: Date.now(),
				userAgent: navigator.userAgent,
				viewport: {
					width: window.innerWidth,
					height: window.innerHeight,
				},
			};

			// Send to background for logging
			chrome.runtime.sendMessage({
				type: "REPORT_ERROR",
				data: errorContext,
			});

			// Update UI to show error recovery
			const widget = document.getElementById("onecall-widget") as any;
			if (widget?.state) {
				widget.state.transcriptMessages?.push({
					id: `error_${Date.now()}`,
					role: "ai",
					content: "I encountered an issue. Let me try a different approach.",
					timestamp: Date.now(),
				});
			}

			return { success: true, reported: true, errorId: `err_${Date.now()}` };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	/** Check if site owner is online */
	async checkOwnerAvailability() {
		try {
			const response = await new Promise<any>((resolve) => {
				chrome.runtime.sendMessage(
					{
						type: "CHECK_OWNER_AVAILABILITY",
						domain: window.location.hostname,
					},
					resolve
				);
			});

			return {
				success: true,
				available: response.available || false,
				workingHours: response.workingHours || null,
				estimatedResponseTime: response.estimatedResponseTime || null,
			};
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	/** Draft email for user */
	async draftEmail(params: { subject: string; body: string; recipient?: string }) {
		const { subject, body, recipient } = params;

		try {
			// Find contact email on page
			const contactEmail = recipient || this.findContactEmail();

			const emailData = {
				to: contactEmail,
				subject,
				body,
				timestamp: Date.now(),
			};

			// Store draft in chrome.storage
			chrome.storage.local.set({ emailDraft: emailData });

			// Update UI
			const widget = document.getElementById("onecall-widget") as any;
			if (widget?.state) {
				widget.state.transcriptMessages?.push({
					id: `email_${Date.now()}`,
					role: "ai",
					content: `I've drafted an email for you. Would you like to review and send it?`,
					timestamp: Date.now(),
				});
			}

			return {
				success: true,
				drafted: true,
				emailData,
			};
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	/** Find contact email on page */
	private findContactEmail(): string | null {
		// Search for mailto links
		const mailtoLinks = document.querySelectorAll('a[href^="mailto:"]');
		if (mailtoLinks.length > 0) {
			const href = (mailtoLinks[0] as HTMLAnchorElement).href;
			return href.replace("mailto:", "").split("?")[0];
		}

		// Search for email patterns in text
		const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
		const bodyText = document.body.innerText;
		const matches = bodyText.match(emailRegex);

		if (matches && matches.length > 0) {
			// Filter out common invalid emails
			const validEmails = matches.filter(
				(email) => !email.includes("example.com") && !email.includes("test.com") && email.includes("@")
			);

			return validEmails[0] || null;
		}

		return null;
	}
}
