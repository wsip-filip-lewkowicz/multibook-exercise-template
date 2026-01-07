// Preview size options
const PREVIEW_SIZE_OPTIONS = [
	{ value: "small", label: "Mały" },
	{ value: "default", label: "Domyślny" },
	{ value: "large", label: "Duży" },
	{ value: "fullscreen", label: "Pełny ekran" },
];

const PREVIEW_SIZE_DEFAULT = "default";
const STORAGE_KEY_ENABLED = "previewEnabled";
const STORAGE_KEY_SIZE = "previewSize";

// State
let isPreviewEnabled = false;
let currentSize = PREVIEW_SIZE_DEFAULT;
let modalOverlay = null;
let modalHeader = null;
let toggleButton = null;

// Initialize preview feature
export function initPreview() {
	// Load state from localStorage
	isPreviewEnabled = localStorage.getItem(STORAGE_KEY_ENABLED) === "true";
	currentSize = localStorage.getItem(STORAGE_KEY_SIZE) || PREVIEW_SIZE_DEFAULT;

	// Create toggle button
	createToggleButton();

	// Create modal elements
	createModalElements();

	// Add keyboard listener
	document.addEventListener("keydown", handleKeyDown);

	// If preview was enabled, open modal
	if (isPreviewEnabled) {
		openModal();
	}
}

// Create toggle button
function createToggleButton() {
	toggleButton = document.createElement("button");
	toggleButton.className = `c-btn preview-toggle ${isPreviewEnabled ? " preview-toggle--active" : ""}`;
	toggleButton.innerHTML = `
		Pokaż w modalu
	`;
	toggleButton.addEventListener("click", handleToggleClick);
	document.body.appendChild(toggleButton);
}

// Create modal elements
function createModalElements() {
	// Create overlay
	modalOverlay = document.createElement("div");
	modalOverlay.className = "modal-overlay";
	modalOverlay.innerHTML = `
		<div class="modal modal--${currentSize}">
			<div class="modal__body"></div>
		</div>
	`;
	modalOverlay.addEventListener("click", handleOverlayClick);
	document.body.appendChild(modalOverlay);

	// Create header (only controls, no label)
	modalHeader = document.createElement("div");
	modalHeader.className = "modal-header";
	modalHeader.innerHTML = `
		<select class="js-modal-size modal-header__size-select">
			${PREVIEW_SIZE_OPTIONS.map(
				(opt) =>
					`<option value="${opt.value}"${opt.value === currentSize ? " selected" : ""}>${opt.label}</option>`,
			).join("")}
		</select>
		<button class="js-modal-close modal-header__close">✕</button>
	`;

	document.body.appendChild(modalHeader);

	// Use event delegation on body for modal controls
	document.body.addEventListener("click", (e) => {
		if (e.target.closest(".js-modal-close")) {
			handleClose();
		}
	});

	document.body.addEventListener("change", (e) => {
		if (e.target.closest(".js-modal-size")) {
			handleSizeChange(e);
		}
	});
}

// Handle toggle button click
function handleToggleClick() {
	isPreviewEnabled = !isPreviewEnabled;
	localStorage.setItem(STORAGE_KEY_ENABLED, isPreviewEnabled);

	toggleButton.classList.toggle("preview-toggle--active", isPreviewEnabled);

	if (isPreviewEnabled) {
		openModal();
	} else {
		closeModal();
	}
}

// Handle overlay click (close on backdrop click)
function handleOverlayClick(e) {
	if (e.target === modalOverlay) {
		handleClose();
	}
}

// Handle Escape key
function handleKeyDown(e) {
	if (e.key === "Escape" && isPreviewEnabled) {
		handleClose();
	}
}

// Handle size change
function handleSizeChange(e) {
	const newSize = e.target.value;
	currentSize = newSize;
	localStorage.setItem(STORAGE_KEY_SIZE, newSize);

	const modal = modalOverlay.querySelector(".modal");
	modal.className = `modal modal--${newSize}`;
}

// Handle close button click
function handleClose() {
	isPreviewEnabled = false;
	localStorage.setItem(STORAGE_KEY_ENABLED, "false");
	toggleButton.classList.remove("preview-toggle--active");
	closeModal();
}

// Open modal
function openModal() {
	// Clone main content
	const mainContent = document.querySelector("main");
	const modalBody = modalOverlay.querySelector(".modal__body");

	if (mainContent) {
		modalBody.innerHTML = mainContent.innerHTML;
	}

	// Show modal and header
	modalOverlay.classList.add("modal-overlay--visible");
	modalHeader.classList.add("modal-header--visible");
}

// Close modal
function closeModal() {
	modalOverlay.classList.remove("modal-overlay--visible");
	modalHeader.classList.remove("modal-header--visible");
}
