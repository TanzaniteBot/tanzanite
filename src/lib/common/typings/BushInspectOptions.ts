import { type InspectOptions } from 'util';

/**
 * {@link https://nodejs.org/api/util.html#utilinspectobject-showhidden-depth-colors util.inspect Options Documentation}
 */
export interface BushInspectOptions extends InspectOptions {
	/**
	 * If `true`, object's non-enumerable symbols and properties are included in the
	 * formatted result. [`WeakMap`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)
	 * and [`WeakSet`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet) entries
	 * are also included as well as user defined prototype properties (excluding method properties).
	 *
	 * @default false
	 */
	showHidden?: boolean | undefined;

	/**
	 * Specifies the number of times to recurse while formatting `object`. This is useful
	 * for inspecting large objects. To recurse up to the maximum call stack size pass
	 * `Infinity` or `null`.
	 *
	 * @default 2
	 */
	depth?: number | null | undefined;

	/**
	 * If `true`, the output is styled with ANSI color codes. Colors are customizable. See
	 * [Customizing util.inspect colors](https://nodejs.org/api/util.html#util_customizing_util_inspect_colors).
	 *
	 * @default false
	 */
	colors?: boolean | undefined;

	/**
	 * If `false`, `[util.inspect.custom](depth, opts)` functions are not invoked.
	 *
	 * @default true
	 */
	customInspect?: boolean | undefined;

	/**
	 * If `true`, `Proxy` inspection includes the
	 * [`target` and `handler`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy#Terminology)
	 * objects.
	 *
	 * @default false
	 */
	showProxy?: boolean | undefined;

	/**
	 * Specifies the maximum number of `Array`, [`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray),
	 * [`WeakMap`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap) and
	 * [`WeakSet`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet) elements to
	 * include when formatting. Set to `null` or `Infinity` to show all elements.
	 * Set to `0` or negative to show no elements.
	 *
	 * @default 100
	 */
	maxArrayLength?: number | null | undefined;

	/**
	 * Specifies the maximum number of characters to include when formatting. Set to
	 * `null` or `Infinity` to show all elements. Set to `0` or negative to show no
	 * characters.
	 *
	 * @default 10000
	 */
	maxStringLength?: number | null | undefined;

	/**
	 * The length at which input values are split across multiple lines. Set to
	 * `Infinity` to format the input as a single line (in combination with compact set
	 * to `true` or any number >= `1`).
	 *
	 * @default 80
	 */
	breakLength?: number | undefined;

	/**
	 * Setting this to `false` causes each object key to be displayed on a new line. It
	 * will break on new lines in text that is longer than `breakLength`. If set to a
	 * number, the most `n` inner elements are united on a single line as long as all
	 * properties fit into `breakLength`. Short array elements are also grouped together.
	 *
	 * @default 3
	 */
	compact?: boolean | number | undefined;

	/**
	 * If set to `true` or a function, all properties of an object, and `Set` and `Map`
	 * entries are sorted in the resulting string. If set to `true` the
	 * [default sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) is used.
	 * If set to a function, it is used as a
	 * [compare function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#parameters).
	 *
	 * @default false
	 */
	sorted?: boolean | ((a: string, b: string) => number) | undefined;

	/**
	 * If set to `true`, getters are inspected. If set to `'get'`, only getters without a
	 * corresponding setter are inspected. If set to `'set'`, only getters with a
	 * corresponding setter are inspected. This might cause side effects depending on
	 * the getter function.
	 *
	 * @default false
	 */
	getters?: 'get' | 'set' | boolean | undefined;

	/**
	 * Whether or not to inspect strings.
	 *
	 * @default false
	 */
	inspectStrings?: boolean;
}
