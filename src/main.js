import "./styles/base.css";
import { sdk } from "@/sdk";
import { initPreview } from "./preview-modal.js";
import { initJsonTest } from "./jsonLoadTest.js";

// Example: listen for keyboard events from parent
sdk.on("keyboardPressed", ({ key }) => {
	console.log("Key pressed:", key);
});

// Initialize on DOM ready
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", () => {
		// Preview modal only in dev mode
		if (import.meta.env.DEV) {
			initPreview();
		}
		initJsonTest();
	});
} else {
	// Preview modal only in dev mode
	if (import.meta.env.DEV) {
		initPreview();
	}
	initJsonTest();
}
