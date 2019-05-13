module.exports = {
	transform: {
		"\\.tsx?$": "ts-jest"
	},
	testRegex: "(/__tests__/.*\\.(test|spec))\\.(ts|tsx|js)$",
	moduleFileExtensions: ["ts", "tsx", "js", "json"],
	globals: {
		"ts-jest": {
			tsConfig: "tsconfig.json"
		}
	}
};
