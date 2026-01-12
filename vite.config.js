import { resolve } from "node:path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [],
	base: "./",
	resolve: {
		alias: {
			"@": resolve(import.meta.dirname, "src"),
		},
	},
});
