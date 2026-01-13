import "./styles/base.css";
import { initJsonTest } from "./jsonLoadTest.js";
import { initKeyboard } from "./keyboard.js";

// Initialize on DOM ready
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", init);
} else {
	init();
}

async function init() {
	// Preview modal only in dev mode - dynamic import ensures 0 bytes in prod
	if (import.meta.env.DEV) {
		const { initPreview } = await import("./preview-modal.js");
		initPreview();
	}
	initJsonTest();
	initKeyboard();
}
