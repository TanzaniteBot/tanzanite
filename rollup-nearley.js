// https://github.com/kach/nearley/issues/535#issuecomment-882066992
import commonjs from '@rollup/plugin-commonjs';

export default {
	input: 'dist/lib/dice/dice-grammar.umd.js',
	output: {
		file: 'dist/lib/dice/dice-grammar.js',
		format: 'es'
	},
	plugins: [
		commonjs({
			esmExternals: true
		})
	]
};
