const MESSAGE_TYPE = "multibook:event";

class MultibookSDK {
	#listeners = new Map();

	constructor() {
		this.#setupMessageListener();
		this.#setupPageNavigation();
		this.#emitReady();
	}

	/**
	 * Emit event to parent window
	 * @param {string} event - Event name
	 * @param {object} payload - Event payload
	 */
	emit(event, payload = {}) {
		window.parent.postMessage(
			{
				type: MESSAGE_TYPE,
				event,
				payload,
			},
			"*"
		);
	}

	/**
	 * Listen for events from parent window
	 * @param {string} event - Event name
	 * @param {function} callback - Callback function
	 * @returns {function} Unsubscribe function
	 */
	on(event, callback) {
		if (!this.#listeners.has(event)) {
			this.#listeners.set(event, new Set());
		}
		this.#listeners.get(event).add(callback);

		return () => {
			this.#listeners.get(event).delete(callback);
		};
	}

	#setupMessageListener() {
		window.addEventListener("message", (e) => {
			const { data } = e;

			if (data?.type !== MESSAGE_TYPE) return;

			const { event, payload } = data;
			const callbacks = this.#listeners.get(event);

		if (callbacks) {
			callbacks.forEach((cb) => {
				cb(payload);
			});
		}
		});
	}

	#setupPageNavigation() {
		document.addEventListener("click", (e) => {
			const pageTarget = e.target.closest("[data-page]");
			if (pageTarget) {
				const page = Number(pageTarget.dataset.page);
				this.emit("goToPage", { page });
				return;
			}

			const closeTarget = e.target.closest("[data-modal-close]");
			if (closeTarget) {
				this.emit("closeModal", {});
			}
		});
	}

	#emitReady() {
		this.emit("ready", {});
	}
}

export const sdk = new MultibookSDK();
