async function injectActiveCaller() {
  if (!window.customElements) {
    Object.defineProperty(window, "customElements", {
      value: {
        define(name, constructor) {
          const Handler = {
            construct(target, argumentsList, _newTarget) {
              const ctmElement = document.createElement(name);
              const descriptors = Object.getOwnPropertyDescriptors(constructor.prototype);
              Object.defineProperties(ctmElement, descriptors);
              setTimeout(() => ctmElement.connectedCallback(...argumentsList), 0);
              return ctmElement;
            }
          };
          return new Proxy(constructor, Handler);
        }
      },
      writable: false,
      configurable: false,
      enumerable: true
    });
  }
  try {
    await import(chrome.runtime.getURL("scripts/active-call/manager/ActiveCallManager.js"));
  } catch (error) {
    console.error(error);
  }
}
export {
  injectActiveCaller
};
