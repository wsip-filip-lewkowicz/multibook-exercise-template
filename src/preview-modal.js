const PREVIEW_SIZES = [
	{ value: "small", label: "Mały" },
	{ value: "default", label: "Domyślny" },
	{ value: "large", label: "Duży" },
	{ value: "fullscreen", label: "Pełny ekran" },
];
const STORAGE_KEY_SIZE = "previewSize";

export function initPreview() {
	const savedSize = localStorage.getItem(STORAGE_KEY_SIZE) || "default";

	document.body.classList.add("dev-preview-mode", `dev-preview--${savedSize}`);
	createSizeSelector(savedSize);
}

function createSizeSelector(currentSize) {
	const header = document.createElement("div");
	header.className = "dev-preview-header";

	const select = document.createElement("select");
	select.className = "dev-preview-size";
	PREVIEW_SIZES.forEach(({ value, label }) => {
		const option = document.createElement("option");
		option.value = value;
		option.textContent = label;
		option.selected = value === currentSize;
		select.appendChild(option);
	});

	select.addEventListener("change", (e) => {
		const newSize = e.target.value;
		localStorage.setItem(STORAGE_KEY_SIZE, newSize);

		PREVIEW_SIZES.forEach(({ value }) => document.body.classList.remove(`dev-preview--${value}`));
		document.body.classList.add(`dev-preview--${newSize}`);
	});

	header.appendChild(select);
	document.body.prepend(header);
}
