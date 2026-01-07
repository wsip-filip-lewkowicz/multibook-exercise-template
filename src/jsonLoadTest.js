const testData = [
	{ id: 1, name: "Element pierwszy", value: 100 },
	{ id: 2, name: "Element drugi", value: 200 },
	{ id: 3, name: "Element trzeci", value: 300 },
];

export function initJsonTest() {
	const container = document.querySelector(".js-json-test");
	if (!container) return;

	const list = document.createElement("ul");
	testData.forEach((item) => {
		const li = document.createElement("li");
		li.textContent = `${item.name}: ${item.value}`;
		list.appendChild(li);
	});

	container.appendChild(list);
}
