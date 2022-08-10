module.exports = {
	env: {
		browser: true,
		es2021: true,
		node: true,
	},
	extends: [
		'airbnb-base',
		'airbnb-typescript/base',
	],
	parserOptions: {
		project: './tsconfig.eslint.json',
	},
	rules: {
		// rule for correct work with windows style of breaking lines - CRLF
		'linebreak-style': ['error', 'windows'],
		// rule for working with tabs as intends instead of spaces
		// also here is addition to "switch/case" construction
		indent: [2, 'tab', { SwitchCase: 1 }],
		'@typescript-eslint/indent': [2, 'tab'],
		'no-tabs': 0,
	},
};
