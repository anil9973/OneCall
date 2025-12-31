class EscalationTools {
  /** Escalate conversation to human support */
  async escalateToHuman(params) {
    const { reason, priority = "medium", context = "" } = params;
    try {
      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: "ESCALATE_TO_HUMAN",
            data: {
              reason,
              priority,
              context,
              url: window.location.href,
              timestamp: Date.now()
            }
          },
          resolve
        );
      });
      if (response.success) {
        const widget = document.getElementById("onecall-widget");
        if (widget?.state) {
          widget.state.aiState = "thinking";
          widget.state.transcriptMessages?.push({
            id: `escalation_${Date.now()}`,
            role: "ai",
            content: response.ownerAvailable ? "Connecting you to a human agent. Please hold..." : "Your request has been sent to support. They will contact you shortly.",
            timestamp: Date.now()
          });
        }
        return {
          success: true,
          escalated: true,
          ownerAvailable: response.ownerAvailable,
          estimatedWaitTime: response.estimatedWaitTime || null
        };
      }
      return response;
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
  /** Report error to backend */
  async reportError(params) {
    const { errorType, message, toolName, stackTrace } = params;
    try {
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
          height: window.innerHeight
        }
      };
      chrome.runtime.sendMessage({
        type: "REPORT_ERROR",
        data: errorContext
      });
      const widget = document.getElementById("onecall-widget");
      if (widget?.state) {
        widget.state.transcriptMessages?.push({
          id: `error_${Date.now()}`,
          role: "ai",
          content: "I encountered an issue. Let me try a different approach.",
          timestamp: Date.now()
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
      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: "CHECK_OWNER_AVAILABILITY",
            domain: window.location.hostname
          },
          resolve
        );
      });
      return {
        success: true,
        available: response.available || false,
        workingHours: response.workingHours || null,
        estimatedResponseTime: response.estimatedResponseTime || null
      };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
  /** Draft email for user */
  async draftEmail(params) {
    const { subject, body, recipient } = params;
    try {
      const contactEmail = recipient || this.findContactEmail();
      const emailData = {
        to: contactEmail,
        subject,
        body,
        timestamp: Date.now()
      };
      chrome.storage.local.set({ emailDraft: emailData });
      const widget = document.getElementById("onecall-widget");
      if (widget?.state) {
        widget.state.transcriptMessages?.push({
          id: `email_${Date.now()}`,
          role: "ai",
          content: `I've drafted an email for you. Would you like to review and send it?`,
          timestamp: Date.now()
        });
      }
      return {
        success: true,
        drafted: true,
        emailData
      };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
  /** Find contact email on page */
  findContactEmail() {
    const mailtoLinks = document.querySelectorAll('a[href^="mailto:"]');
    if (mailtoLinks.length > 0) {
      const href = mailtoLinks[0].href;
      return href.replace("mailto:", "").split("?")[0];
    }
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    const bodyText = document.body.innerText;
    const matches = bodyText.match(emailRegex);
    if (matches && matches.length > 0) {
      const validEmails = matches.filter(
        (email) => !email.includes("example.com") && !email.includes("test.com") && email.includes("@")
      );
      return validEmails[0] || null;
    }
    return null;
  }
}
export {
  EscalationTools
};
