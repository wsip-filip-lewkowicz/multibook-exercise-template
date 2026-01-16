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

	// Shift icon classes by state
	const SHIFT_ICONS = {
		off: "ph ph-arrow-fat-up",
		single: "ph-fill ph-arrow-fat-up",
		capslock: "ph-fill ph-arrow-fat-lines-up",
	};

	// Bottom row special keys configuration
	const BOTTOM_ROW_KEYS = [
		{ icon: "ph-fill ph-backspace", key: "backspace", variant: "action" },
		{
			icon: "ph-fill ph-backspace",
			key: "delete-forward",
			variant: "action",
			style: "transform: rotate(180deg)",
		},
		{ icon: "ph ph-arrow-left", key: "left", variant: "action" },
		{ icon: "ph ph-arrow-right", key: "right", variant: "action" },
	];

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
				const label =
					keyboardMode === "letters" && isUppercase ? key.toUpperCase() : key;
				rowEl.appendChild(createKeyButton(label, key));
			}

			rowsContainer.appendChild(rowEl);
		}

		// Bottom row with special keys
		const bottomRow = document.createElement("div");
		bottomRow.className = "virtual-keyboard__row";

		// Mode toggle (ABC/123)
		const modeLabel = keyboardMode === "letters" ? "123" : "ABC";
		bottomRow.appendChild(createKeyButton(modeLabel, modeLabel, "wide"));

		// Shift
		const shiftBtn = createIconButton(SHIFT_ICONS[shiftState], "shift", "wide");
		if (shiftState !== "off") {
			shiftBtn.classList.add("virtual-keyboard__key--shift-active");
		}
		bottomRow.appendChild(shiftBtn);

		// Space
		bottomRow.appendChild(createKeyButton("spacja", "space", "space"));

		// Action keys (backspace, delete, arrows)
		for (const { icon, key, variant, style } of BOTTOM_ROW_KEYS) {
			bottomRow.appendChild(createIconButton(icon, key, variant, style));
		}

		rowsContainer.appendChild(bottomRow);
	}

	// Create a key button
	function createKeyButton(label, key, variant = "default") {
		const btn = document.createElement("button");
		btn.type = "button";
		btn.className = "virtual-keyboard__key";
		btn.textContent = label;

		if (variant !== "default") {
			btn.classList.add(`virtual-keyboard__key--${variant}`);
		}

		btn.addEventListener("mousedown", (e) => e.preventDefault());
		btn.addEventListener("click", (e) => {
			e.stopPropagation();
			handleKeyPress(key);
		});

		return btn;
	}

	// Create an icon button
	function createIconButton(iconClass, key, variant, style = "") {
		const btn = createKeyButton("", key, variant);
		const icon = document.createElement("i");
		icon.className = iconClass;
		if (style) {
			icon.style.cssText = style;
		}
		btn.appendChild(icon);
		return btn;
	}

	// Handle shift key with double-tap detection
	function handleShift() {
		const now = Date.now();
		const isDoubleTap =
			now - lastShiftTap < DOUBLE_TAP_THRESHOLD && shiftState === "single";

		if (isDoubleTap) {
			shiftState = "capslock";
		} else if (shiftState === "off") {
			shiftState = "single";
		} else {
			shiftState = "off";
		}

		lastShiftTap = now;
		renderKeys();
	}

	// Maybe reset shift after typing (special keys don't reset shift)
	function maybeResetShift(key) {
		if (shiftState === "single" && !(key in KEY_MAP)) {
			shiftState = "off";
			renderKeys();
		}
	}

	// Handle key press
	function handleKeyPress(key) {
		// Handle shift key
		if (key === "shift") {
			handleShift();
			return;
		}

		// Handle mode switching
		if (key === "ABC" || key === "123") {
			keyboardMode = key === "ABC" ? "letters" : "numbers";
			renderKeys();
			return;
		}

		// Map special key or use character
		const isUppercase = shiftState !== "off";
		const char = KEY_MAP[key] ?? (isUppercase ? key.toUpperCase() : key);

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

			// Prevent focus loss from input field
			e.preventDefault();

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

	// Hide keyboard visually (internal helper)
	function hideVisually() {
		if (!isVisible) return false;
		isVisible = false;
		keyboardEl.classList.add("virtual-keyboard--hidden");
		return true;
	}

	// Hide keyboard and notify parent
	function hide() {
		if (hideVisually()) {
			sdk.emit("keyboardClose", {});
		}
	}

	// Listen for SDK events
	sdk.on("keyboardOpen", () => show());
	sdk.on("keyboardClose", () => hideVisually());

	// Create the keyboard UI
	createKeyboardUI();
}
