/* eslint-disable import/no-commonjs */
/**
 * @type {import('ts-jest/dist/types').InitialOptionsTsJest}
 */
module.exports = {
	// preset: 'ts-jest',
	// preset: 'ts-jest/presets/default-esm',
	testEnvironment: 'node',
	extensionsToTreatAsEsm: ['.ts'],
	globals: {
		'ts-jest': {
			useESM: true
		}
	},
	moduleNameMapper: {
		'^#lib$': '<rootDir>/dist/src/lib/index.js',
		'^#constants$': '<rootDir>/dist/src/lib/utils/BushConstants.js',
		'^#args$': '<rootDir>/dist/src/arguments/index.js',
		'^#commands$': '<rootDir>/dist/src/commands/index.js'
	}
};
