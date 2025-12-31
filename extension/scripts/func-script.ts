export async function injectActiveCaller() {
	if (!(window as any).customElements) {
		Object.defineProperty(window, "customElements", {
			value: {
				define<K extends string, T extends { new (...args: any[]): any }>(name: K, constructor: T): T {
					const Handler: ProxyHandler<T> = {
						construct(target, argumentsList, _newTarget) {
							const ctmElement = document.createElement(name) as InstanceType<T>;
							// Copy prototype methods/properties to element instance
							const descriptors = Object.getOwnPropertyDescriptors(constructor.prototype);
							Object.defineProperties(ctmElement, descriptors);
							// Call connectedCallback async (to mimic browser behavior)
							setTimeout(() => ctmElement.connectedCallback(...argumentsList), 0);
							return ctmElement;
						},
					};

					// Return constructor wrapped by Proxy
					return new Proxy(constructor, Handler);
				},
			},
			writable: false,
			configurable: false,
			enumerable: true,
		});
	}
	try {
		await import(chrome.runtime.getURL("scripts/active-call/manager/ActiveCallManager.js"));
	} catch (error) {
		console.error(error);
	}
}
