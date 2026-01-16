import "./styles/virtual-keyboard.css";
import { sdk } from "@/sdk";

export function initVirtualKeyboard() {
	// Keyboard state
	let isVisible = false;
	let shiftState = "off"; // off | single | capslock
	let keyboardMode = "letters"; // letters | numbers
	let lastShiftTap = 0;
	const DOUBLE_TAP_THRESHOLD = 300;

	// Drag state
	let isDragging = false;
	let dragStart = { x: 0, y: 0 };
	let position = { x: 0, y: 0 };

	// Keyboard layouts
	const LAYOUTS = {
		letters: [
			["a", "ą", "b", "c", "ć", "d", "e", "ę", "f", "g", "h"],
			["i", "j", "k", "l", "ł", "m", "n", "ń", "o", "ó", "p"],
			["r", "s", "ś", "t", "u", "w", "x", "y", "z", "ź", "ż"],
		],
		numbers: [
			["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
			["-", "/", ":", ";", ",", ".", "?", "!", "(", ")"],
			['"', "•", "+", "*", "<", ">", "="],
		],
	};

	// Special keys mapping to KeyboardEvent.key values
	const KEY_MAP = {
		backspace: "Backspace",
		"delete-forward": "Delete",
		space: " ",
		left: "ArrowLeft",
		right: "ArrowRight",
	};

	// Keys that should not reset shift
	const NON_SHIFT_KEYS = ["backspace", "delete-forward", "space", "left", "right"];

	// DOM elements
	let keyboardEl = null;
	let rowsContainer = null;

	// Create keyboard DOM
	function createKeyboardUI() {
		keyboardEl = document.createElement("div");
		keyboardEl.className = "virtual-keyboard virtual-keyboard--hidden";

		// Close button
		const closeBtn = document.createElement("button");
		closeBtn.className = "virtual-keyboard__close";
		closeBtn.type = "button";
		closeBtn.innerHTML = '<i class="ph-bold ph-x"></i>';
		closeBtn.addEventListener("mousedown", (e) => e.preventDefault());
		closeBtn.addEventListener("click", (e) => {
			e.stopPropagation();
			hide();
		});

		// Rows container
		rowsContainer = document.createElement("div");
		rowsContainer.className = "virtual-keyboard__rows";

		keyboardEl.appendChild(closeBtn);
		keyboardEl.appendChild(rowsContainer);
		document.body.appendChild(keyboardEl);

		// Setup drag handlers
		setupDrag();

		// Initial render
		renderKeys();
	}

	// Render keyboard keys
	function renderKeys() {
		rowsContainer.innerHTML = "";

		const isUppercase = shiftState !== "off";
		const currentLayout = LAYOUTS[keyboardMode];

		// Character rows
		for (const row of currentLayout) {
			const rowEl = document.createElement("div");
			rowEl.className = "virtual-keyboard__row";

			for (const key of row) {
				const btn = createKeyButton(
					keyboardMode === "letters" && isUppercase ? key.toUpperCase() : key,
					key,
				);
				rowEl.appendChild(btn);
			}

			rowsContainer.appendChild(rowEl);
		}

		// Bottom row with special keys
		const bottomRow = document.createElement("div");
		bottomRow.className = "virtual-keyboard__row";

		// Mode toggle (ABC/123)
		const modeBtn = createKeyButton(
			keyboardMode === "letters" ? "123" : "ABC",
			keyboardMode === "letters" ? "123" : "ABC",
			"wide",
		);
		bottomRow.appendChild(modeBtn);

		// Shift
		const shiftBtn = createKeyButton(
			`<i class="${getShiftIcon()}"></i>`,
			"shift",
			"wide",
			true,
		);
		if (shiftState !== "off") {
			shiftBtn.classList.add("virtual-keyboard__key--shift-active");
		}
		bottomRow.appendChild(shiftBtn);

		// Space
		const spaceBtn = createKeyButton("spacja", "space", "space");
		bottomRow.appendChild(spaceBtn);

		// Backspace
		const backspaceBtn = createKeyButton(
			'<i class="ph-fill ph-backspace"></i>',
			"backspace",
			"action",
			true,
		);
		bottomRow.appendChild(backspaceBtn);

		// Delete forward
		const deleteBtn = createKeyButton(
			'<i class="ph-fill ph-backspace" style="transform: rotate(180deg)"></i>',
			"delete-forward",
			"action",
			true,
		);
		bottomRow.appendChild(deleteBtn);

		// Arrow left
		const leftBtn = createKeyButton(
			'<i class="ph ph-arrow-left"></i>',
			"left",
			"action",
			true,
		);
		bottomRow.appendChild(leftBtn);

		// Arrow right
		const rightBtn = createKeyButton(
			'<i class="ph ph-arrow-right"></i>',
			"right",
			"action",
			true,
		);
		bottomRow.appendChild(rightBtn);

		rowsContainer.appendChild(bottomRow);
	}

	// Create a key button
	function createKeyButton(label, key, variant = "default", isHtml = false) {
		const btn = document.createElement("button");
		btn.type = "button";
		btn.className = "virtual-keyboard__key";

		if (variant !== "default") {
			btn.classList.add(`virtual-keyboard__key--${variant}`);
		}

		if (isHtml) {
			btn.innerHTML = label;
		} else {
			btn.textContent = label;
		}

		btn.addEventListener("mousedown", (e) => e.preventDefault());
		btn.addEventListener("click", (e) => {
			e.stopPropagation();
			handleKeyPress(key);
		});

		return btn;
	}

	// Get shift icon based on state
	function getShiftIcon() {
		switch (shiftState) {
			case "single":
				return "ph-fill ph-arrow-fat-up";
			case "capslock":
				return "ph-fill ph-arrow-fat-lines-up";
			default:
				return "ph ph-arrow-fat-up";
		}
	}

	// Handle shift key with double-tap detection
	function handleShift() {
		const now = Date.now();
		const timeSinceLastTap = now - lastShiftTap;

		if (timeSinceLastTap < DOUBLE_TAP_THRESHOLD && shiftState === "single") {
			// Double-tap: caps lock
			shiftState = "capslock";
		} else {
			// Single tap: cycle states
			switch (shiftState) {
				case "off":
					shiftState = "single";
					break;
				case "single":
				case "capslock":
					shiftState = "off";
					break;
			}
		}

		lastShiftTap = now;
		renderKeys();
	}

	// Maybe reset shift after typing
	function maybeResetShift(key) {
		if (shiftState === "single" && !NON_SHIFT_KEYS.includes(key)) {
			shiftState = "off";
			renderKeys();
		}
	}

	// Handle key press
	function handleKeyPress(key) {
		if (key === "shift") {
			handleShift();
			return;
		}

		if (key === "ABC") {
			keyboardMode = "letters";
			renderKeys();
			return;
		}

		if (key === "123") {
			keyboardMode = "numbers";
			renderKeys();
			return;
		}

		// Map special key or use character
		const mappedKey = KEY_MAP[key];
		const isUppercase = shiftState !== "off";
		const char = mappedKey ?? (isUppercase ? key.toUpperCase() : key);

		// Send via postMessage to simulate parent communication
		window.postMessage(
			{
				type: "multibook:event",
				event: "keyboardPressed",
				payload: { key: char },
			},
			"*",
		);

		maybeResetShift(key);
	}

	// Setup drag functionality
	function setupDrag() {
		keyboardEl.addEventListener("mousedown", (e) => {
			// Ignore if clicking on buttons
			if (e.target.closest("button")) return;

			isDragging = true;
			dragStart = {
				x: e.clientX - position.x,
				y: e.clientY - position.y,
			};
			keyboardEl.style.cursor = "grabbing";
		});

		document.addEventListener("mousemove", (e) => {
			if (!isDragging) return;

			const newX = e.clientX - dragStart.x;
			const newY = e.clientY - dragStart.y;

			// Clamp to screen bounds
			const margin = 10;
			const rect = keyboardEl.getBoundingClientRect();
			const maxX = window.innerWidth - rect.width - margin;
			const maxY = window.innerHeight - rect.height - margin;

			position.x = Math.max(margin, Math.min(newX, maxX));
			position.y = Math.max(margin, Math.min(newY, maxY));

			keyboardEl.style.left = `${position.x}px`;
			keyboardEl.style.top = `${position.y}px`;
		});

		document.addEventListener("mouseup", () => {
			if (isDragging) {
				isDragging = false;
				keyboardEl.style.cursor = "grab";
			}
		});
	}

	// Show keyboard
	function show() {
		if (isVisible) return;
		isVisible = true;

		// Center horizontally, position near bottom
		const keyboardWidth = 656;
		const keyboardHeight = 300;
		position.x = (window.innerWidth - keyboardWidth) / 2;
		position.y = window.innerHeight - keyboardHeight - 50;

		keyboardEl.style.left = `${position.x}px`;
		keyboardEl.style.top = `${position.y}px`;
		keyboardEl.classList.remove("virtual-keyboard--hidden");

		// Reset state
		shiftState = "off";
		keyboardMode = "letters";
		renderKeys();
	}

	// Hide keyboard
	function hide() {
		if (!isVisible) return;
		isVisible = false;
		keyboardEl.classList.add("virtual-keyboard--hidden");

		// Emit close event so parent knows
		sdk.emit("keyboardClose", {});
	}

	// Listen for SDK events
	sdk.on("keyboardOpen", () => show());
	sdk.on("keyboardClose", () => {
		if (isVisible) {
			isVisible = false;
			keyboardEl.classList.add("virtual-keyboard--hidden");
		}
	});

	// Create the keyboard UI
	createKeyboardUI();
}
