import { sdk } from "@/sdk";

export function initKeyboard() {
	const keyboardOutput = document.querySelector(".js-keyboard-output");

	// Listen for keyboard events from parent and display in output
	sdk.on("keyboardPressed", ({ key }) => {
		console.log("Key pressed:", key);
		if (keyboardOutput) {
			keyboardOutput.textContent += key;
		}
	});

	// Keyboard open button
	document.querySelector("[data-keyboard-open]")?.addEventListener("click", () => {
		sdk.emit("keyboardOpen", {});
	});

	// Keyboard close button
	document.querySelector("[data-keyboard-close]")?.addEventListener("click", () => {
		sdk.emit("keyboardClose", {});
	});
}
