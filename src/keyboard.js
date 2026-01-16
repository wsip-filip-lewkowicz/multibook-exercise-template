import { sdk } from "@/sdk";

const SELECTORS = {
	keyboardOutput: ".js-keyboard-output",
	keyboardOpen: "[data-keyboard-open]",
	keyboardClose: "[data-keyboard-close]",
};

const KEY_ACTIONS = {
	Backspace: () => deleteCharacter("backward"),
	Delete: () => deleteCharacter("forward"),
	ArrowLeft: () => moveCursor("backward"),
	ArrowRight: () => moveCursor("forward"),
};

export function initKeyboard() {
	const keyboardOutput = document.querySelector(SELECTORS.keyboardOutput);

	if (keyboardOutput) {
		keyboardOutput.setAttribute("contenteditable", "true");
		keyboardOutput.setAttribute("inputmode", "none");
		keyboardOutput.addEventListener("click", () => keyboardOutput.focus());
	}

	sdk.on("keyboardPressed", ({ key }) => {
		if (!keyboardOutput) return;

		keyboardOutput.focus();

		const action = KEY_ACTIONS[key];
		if (action) {
			action();
		} else {
			insertText(key);
		}
	});

	bindKeyboardButton(SELECTORS.keyboardOpen, "keyboardOpen");
	bindKeyboardButton(SELECTORS.keyboardClose, "keyboardClose");
}

function bindKeyboardButton(selector, eventName) {
	document.querySelector(selector)?.addEventListener("click", () => {
		sdk.emit(eventName, {});
	});
}

function getSelection() {
	const sel = window.getSelection();
	if (!sel || sel.rangeCount === 0) return null;
	return sel;
}

function insertText(text) {
	const sel = getSelection();
	if (!sel) return;

	const range = sel.getRangeAt(0);
	range.deleteContents();

	const textNode = document.createTextNode(text);
	range.insertNode(textNode);
	range.collapse(false);
}

function deleteCharacter(direction) {
	const sel = getSelection();
	if (!sel) return;

	const range = sel.getRangeAt(0);

	if (!range.collapsed) {
		range.deleteContents();
		range.collapse(true);
		return;
	}

	sel.modify("extend", direction, "character");
	const extendedRange = sel.getRangeAt(0);
	extendedRange.deleteContents();
	extendedRange.collapse(true);
}

function moveCursor(direction) {
	getSelection()?.modify("move", direction, "character");
}
