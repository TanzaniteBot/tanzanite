/* these functions are adapted from the common-tags npm package which is licensed under the MIT license */
/* the JSDOCs are adapted from the @types/common-tags npm package which is licensed under the MIT license */

/**
 * Strips the **initial** indentation from the beginning of each line in a multiline string.
 */
export function stripIndent(strings: TemplateStringsArray, ...expressions: any[]) {
	const str = format(strings, ...expressions);
	// remove the shortest leading indentation from each line
	const match = str.match(/^[^\S\n]*(?=\S)/gm);
	const indent = match && Math.min(...match.map((el) => el.length));
	if (indent) {
		const regexp = new RegExp(`^.{${indent}}`, 'gm');
		return str.replace(regexp, '');
	}
	return str;
}

/**
 * Strips **all** of the indentation from the beginning of each line in a multiline string.
 */
export function stripIndents(strings: TemplateStringsArray, ...expressions: any[]) {
	const str = format(strings, ...expressions);
	// remove all indentation from each line
	return str.replace(/^[^\S\n]+/gm, '');
}

function format(strings: TemplateStringsArray, ...expressions: any[]) {
	const str = strings
		.reduce((result, string, index) => ''.concat(result, expressions[index - 1], string))
		.replace(/[^\S\n]+$/gm, '')
		.replace(/^\n/, '');
	return str;
}
