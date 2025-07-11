/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* The stripIndent, stripIndents, and format functions are adapted from the common-tags npm package which is licensed under the MIT license */
/* The JSDOCs for said functions are adapted from the @types/common-tags npm package which is licensed under the MIT license */

import { bold } from 'discord.js';

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

export function commas(strings: TemplateStringsArray, ...expressions: any[]) {
	const str = strings
		.reduce((result, string, index) => ''.concat(result, localString(expressions[index - 1]), string))
		.replace(/[^\S\n]+$/gm, '')
		.replace(/^\n/, '');

	return str;
}

function localString(val: any) {
	return typeof val === 'number' ? val.toLocaleString() : val;
}

export function commasStripIndents(strings: TemplateStringsArray, ...expressions: any[]) {
	return stripIndents`${commas(strings, ...expressions)}`;
}

function splitByNewline<T>(strings: TemplateStringsArray, ...expressions: T[]): (string | T)[][] {
	const ret: (string | T)[][] = [];

	let current: (string | T)[] = [];

	for (let i = 0; i < strings.length; i++) {
		const string = strings[i];
		if (string.includes('\n')) {
			// divide the string by newlines
			const [first, ...rest] = string.split('\n');

			// no point add an empty string
			if (first !== '') {
				// complete the current line
				current.push(first);
			}

			// ignore empty first line
			if (i !== 0 && current.length !== 1 && current[1] !== '') {
				// add the current line to the list of lines
				ret.push(current);
			}

			// handle multiple newlines
			if (rest.length > 1) {
				// loop though everything but the final element
				for (const line of rest.slice(0, -1)) {
					ret.push([line]);
				}
			}

			// since there are no more empty newlines, add to the current line so that expressions can be added
			const last = rest[rest.length - 1];
			current = [last];
		} else {
			// if there are no newlines, just add to the current line
			current.push(string);
		}

		// now add the expression
		if (i < expressions.length) current.push(expressions[i]);
	}

	// add the final line
	ret.push(current);

	return ret;
}

/**
 * Creates information fields for embeds. Commas are added to numbers.
 * Lines are ignored if the expression is `null`, `undefined`, or `false`.
 * Additionally, leading whitespace is removed. If the first line is empty,
 * it is ignored.
 * @example
 * ```ts
 * const value = 'value';
 * const condition = false;
 *
 * embedField`
 *   Header ${value}
 *   Another Header ${condition && 50}
 *   A Third Header ${50000}`
 *
 * // **Header:** value
 * // **A Third Header:** 50,000
 * ```
 */
export function embedField(strings: TemplateStringsArray, ...expressions: unknown[]): string {
	const lines = splitByNewline(strings, ...expressions) as [string, ...unknown[]][];

	// loop through each line and remove any leading whitespace
	for (let i = 0; i < lines.length; i++) {
		lines[i][0] = lines[i][0].replace(/^[^\S\n]+/gm, '');
	}

	const result: string[] = [];

	out: for (let i = 0; i < lines.length; i++) {
		let [header, ...rest] = lines[i];

		header = bold(`${header.trim()}:`);

		const lineContent: string[] = [];

		for (let i = 0; i < rest.length; i++) {
			const value = rest[i];
			if (typeof value === 'string') {
				lineContent.push(value);
			} else if (typeof value === 'number') {
				// add commas to numbers
				lineContent.push(value.toLocaleString());
			} else if (value == null || value === false) {
				if (i === 0) {
					// ignore this line
					continue out;
				} else {
					throw new Error('nullish or false values can only be used as the first expression in a line.');
				}
			} else {
				// eslint-disable-next-line @typescript-eslint/no-base-to-string
				lineContent.push(value.toString());
			}
		}

		result.push(`${header} ${lineContent.join('')}`);
	}

	return result.join('\n');
}
