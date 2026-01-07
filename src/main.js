import "./styles/base.css";
import { sdk } from "@/sdk";
import { initPreview } from "./preview-modal.js";
import { initJsonTest } from "./jsonLoadTest.js";

// Example: listen for keyboard events from parent
sdk.on("keyboardPressed", ({ key }) => {
	console.log("Key pressed:", key);
});

// Temporary resize test - remove after testing
function initResizeTest() {
	const placeholder = document.querySelector(".js-resize-placeholder");
	if (!placeholder) return;

	placeholder.style.transition = "height 0.3s ease";

	let expanded = false;

	const toggle = () => {
		expanded = !expanded;
		placeholder.style.height = expanded ? "100vh" : "100px";
	};

	setInterval(toggle, 2000);
}

// Initialize on DOM ready
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", () => {
		// Preview modal only in dev mode
		if (import.meta.env.DEV) {
			initPreview();
		}
		initResizeTest();
		initJsonTest();
	});
} else {
	// Preview modal only in dev mode
	if (import.meta.env.DEV) {
		initPreview();
	}
	initResizeTest();
	initJsonTest();
}
