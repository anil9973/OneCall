import { react, html } from "../../../lib/om.compact.js";
import { CallHeader } from "./header.js";
import { CallControls } from "./controls.js";
import { CallVisualizer } from "./call-visualizer.js";
import { UnofficialBadge } from "./unofficial-badge.js";
import { TranscriptPanel } from "./transcript-panel.js";
import { IVROptionList, UserInput } from "./user-input.js";
import headerCss from "../style/header-footer.css" with { type: "css" };
import widgetCss from "../style/onecall-widget.css" with { type: "css" };
import visualizerCss from "../style/visualizer.css" with { type: "css" };
import transcriptCss from "../style/transcript.css" with { type: "css" };
import inputCss from "../style/user-input.css" with { type: "css" };
class ActiveCallWidget extends HTMLElement {
  shadowRoot;
  state;
  userInput;
  ivrOptionBox;
  contentBody;
  constructor() {
    super();
    this.shadowRoot = this.attachShadow({ mode: "open" });
  }
  render() {
    const narrations = {
      listening: "Listening to your request...",
      thinking: "Processing your question...",
      acting: "Navigating to the orders page...",
      speaking: "Here's what I found..."
    };
    const topHeader = new CallHeader(this.state);
    this.contentBody = document.createElement("section");
    const narrationText = html`<div class="narration-text">${() => narrations[this.state.aiState]}</div>`;
    this.contentBody.append(
      new UnofficialBadge(),
      new CallVisualizer(this.state),
      narrationText,
      new TranscriptPanel(this.state.transcriptMessages),
      new CallControls(this.state)
    );
    topHeader.addEventListener("hidewidget", () => this.hidePopover());
    return [topHeader, this.contentBody];
  }
  async connectedCallback() {
    this.state = react({
      callStatus: "connected",
      aiState: "listening",
      currentPage: "",
      transcriptMessages: [],
      ivrOptions: [],
      userInputRequest: void 0,
      isMuted: false,
      volume: 80,
      isTranscriptExpanded: false,
      unofficialMode: true,
      isUnofficialExpanded: true
    });
    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets.push(headerCss, widgetCss, visualizerCss, inputCss, transcriptCss);
    this.shadowRoot.replaceChildren(...this.render());
    this.id = "onecall-widget";
    this.popover = "manual";
    this.showPopover();
    this.state.$on("userInputRequest", () => {
      if (this.state.userInputRequest) {
        this.userInput = new UserInput(this.state.userInputRequest);
        this.contentBody.lastElementChild?.before(this.userInput);
      } else
        this.userInput?.disconnectedCallback();
    });
    this.state.$on("ivrOptions", () => {
      if (this.state.ivrOptions) {
        this.ivrOptionBox = new IVROptionList(this.state.ivrOptions);
        this.contentBody.lastElementChild?.before(this.ivrOptionBox);
      } else
        this.ivrOptionBox?.disconnectedCallback();
    });
  }
}
ActiveCallWidget = customElements.define("onecall-widget", ActiveCallWidget);
export {
  ActiveCallWidget
};
