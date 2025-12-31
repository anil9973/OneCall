import { injectActiveCaller } from "../scripts/func-script.js";

export const crtTab = async () => (await chrome.tabs.query({ currentWindow: true, active: true }))[0];

export async function injectCallWidget(tabId?: number) {
	await insertCallEngineTab();
	await injectFuncScript(injectActiveCaller, tabId);
}

export async function insertCallEngineTab() {
	const ENGINE_URL = chrome.runtime.getURL("engine/call-engine.html");

	try {
		const response = await chrome.runtime.sendMessage("CALL_ENGINE_PING");
		response || (await createTab());
	} catch (error) {
		await createTab();
	}

	async function createTab() {
		(await chrome.tabs.create({ url: ENGINE_URL, index: 0, active: false })).id;
		await new Promise((r) => setTimeout(r, 200));
	}
}

export async function registerFloatingCallButton() {
	try {
		const store = await chrome.storage.local.get(["matchPatterns", "excludePatterns"]);
		const matches = store.matchPatterns || ["http://*/*", "https://www.amazon.in/*"];
		const excludeMatches = store.excludePatterns || [];
		const SCRIPT_ID = "onecall-floating-button";

		// 3. Register the Floating Phone Script
		await chrome.scripting.registerContentScripts([
			{
				id: SCRIPT_ID,
				js: ["scripts/floating-phone/floating-button.js"],
				matches: matches,
				excludeMatches: excludeMatches,
				runAt: "document_idle",
			},
		]);

		console.log(`[OneCall] Registered floating button`);
	} catch (err) {
		console.error("[OneCall] Failed to register content script", err);
	}
}

export async function injectFuncScript(func: (...args: any[]) => any, ...args) {
	const tab = await crtTab();
	if (!tab) return;
	if (!tab.url?.startsWith("http")) return;
	try {
		const results = await chrome.scripting.executeScript({
			target: { tabId: tab.id },
			func: func,
			args: args,
		});
		return results[0]?.result;
	} catch (error) {
		console.warn(error);
	}
}
