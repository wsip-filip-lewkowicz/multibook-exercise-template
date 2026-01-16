import { sdk } from "@/sdk";

export function initKeyboard() {
	const keyboardOutput = document.querySelector(".js-keyboard-output");

	if (keyboardOutput) {
		// Make output editable for cursor support
		keyboardOutput.setAttribute("contenteditable", "true");

		// Prevent default keyboard from showing on mobile
		keyboardOutput.setAttribute("inputmode", "none");

		// Focus on click to enable cursor positioning
		keyboardOutput.addEventListener("click", () => {
			keyboardOutput.focus();
		});
	}

	// Listen for keyboard events from parent and display in output
	sdk.on("keyboardPressed", ({ key }) => {
		console.log("Key pressed:", key);
		if (!keyboardOutput) return;

		// Focus the output element to ensure execCommand works
		keyboardOutput.focus();

		switch (key) {
			case "Backspace":
				document.execCommand("delete", false);
				break;
			case "Delete":
				document.execCommand("forwardDelete", false);
				break;
			case "ArrowLeft":
				moveCursor(-1);
				break;
			case "ArrowRight":
				moveCursor(1);
				break;
			default:
				// Insert character (including space)
				document.execCommand("insertText", false, key);
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

// Move cursor left or right
function moveCursor(direction) {
	const sel = window.getSelection();
	if (sel && sel.rangeCount > 0) {
		sel.modify("move", direction > 0 ? "forward" : "backward", "character");
	}
}
