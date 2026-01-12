import "./styles/base.css";
import { sdk } from "@/sdk";
import { initJsonTest } from "./jsonLoadTest.js";

// Example: listen for keyboard events from parent
sdk.on("keyboardPressed", ({ key }) => {
	console.log("Key pressed:", key);
});

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
}
