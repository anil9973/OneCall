class UITools {
  /** Update OneCall widget UI state */
  async updateUIState(params) {
    try {
      const widget = document.getElementById("onecall-widget");
      if (!widget)
        return { success: false, error: "Widget not found" };
      if (widget.state)
        Object.assign(widget.state, params);
      return { success: true, updated: Object.keys(params) };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
  /** Request user input via widget */
  async requestUserInput(params) {
    const { type, label, placeholder = "", maxLength } = params;
    try {
      const widget = document.getElementById("onecall-widget");
      if (!widget)
        return { success: false, error: "Widget not found" };
      const requestId = `input_${Date.now()}`;
      if (widget.state)
        widget.state.userInputRequest = { id: requestId, type, label, placeholder, maxLength };
      return new Promise((resolve) => {
        const handleResponse = (event) => {
          if (event.detail.requestId === requestId) {
            document.removeEventListener("onecall:user-input", handleResponse);
            widget.state.userInputRequest = null;
            resolve({ success: true, value: event.detail.value, requestId });
          }
        };
        document.addEventListener("onecall:user-input", handleResponse);
        setTimeout(() => {
          document.removeEventListener("onecall:user-input", handleResponse);
          resolve({ success: false, error: "Input timeout" });
        }, 1e5);
      });
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
  /** Display IVR options in widget */
  async displayIVROptions(params) {
    const { options } = params;
    try {
      const widget = document.getElementById("onecall-widget");
      if (!widget)
        return { success: false, error: "Widget not found" };
      widget.state && (widget.state.ivrOptions = options.map((opt) => ({ number: opt.number, text: opt.text })));
      return new Promise((resolve) => {
        const handleResponse = (event) => {
          document.removeEventListener("onecall:ivr-select", handleResponse);
          widget.state.ivrOptions = null;
          resolve({ success: true, value: event.detail.value });
        };
        document.addEventListener("onecall:ivr-select", handleResponse);
        setTimeout(() => {
          document.removeEventListener("onecall:ivr-select", handleResponse);
          resolve({ success: false, error: "Ivr Option timeout" });
        }, 1e5);
      });
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
  /** Add message to transcript */
  async addTranscriptMessage(params) {
    const { role, content } = params;
    try {
      const widget = document.getElementById("onecall-widget");
      if (!widget)
        return { success: false, error: "Widget not found" };
      if (widget.state?.transcriptMessage) {
        widget.state.transcriptMessages.push({
          id: `msg_${Date.now()}`,
          role,
          content,
          timestamp: Date.now()
        });
      }
      return { success: true, messageAdded: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
}
export {
  UITools
};
