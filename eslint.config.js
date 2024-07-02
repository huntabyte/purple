import config from "@huntabyte/eslint-config";

export default config({
	svelte: true,
}).override("antfu/typescript/rules", {
	rules: {
		"ts/consistent-type-definitions": "off",
	},
});
