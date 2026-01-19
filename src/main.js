import "./styles/base.css";
import { sdk } from "@/sdk";
import { initJsonTest } from "./jsonLoadTest.js";
import { initKeyboard } from "./keyboard.js";

// Initialize on DOM ready
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", init);
} else {
	init();
}

async function init() {
	// Preview modal and virtual keyboard only in dev mode - dynamic import ensures 0 bytes in prod
	if (import.meta.env.DEV) {
		const { initPreview } = await import("./preview-modal.js");
		initPreview();

		const { initVirtualKeyboard } = await import("./virtual-keyboard.js");
		initVirtualKeyboard();
	}
	initJsonTest();
	initKeyboard();
	initMultibookEvents();
}

function initMultibookEvents() {
	sdk.on("init", ({ tools = [], table_of_content = [] } = {}) => {
		console.log("[multibook:init]", { tools, table_of_content });
		window.__multibookTools = tools;
		window.__multibookToc = table_of_content;
	});
}
