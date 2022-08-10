import { type CodeBlockLang } from '#lib';
import {
	bold as discordBold,
	codeBlock as discordCodeBlock,
	escapeBold as discordEscapeBold,
	escapeCodeBlock as discordEscapeCodeBlock,
	escapeInlineCode as discordEscapeInlineCode,
	escapeItalic as discordEscapeItalic,
	escapeMarkdown as discordEscapeMarkdown,
	EscapeMarkdownOptions,
	escapeSpoiler as discordEscapeSpoiler,
	escapeStrikethrough as discordEscapeStrikethrough,
	escapeUnderline as discordEscapeUnderline,
	inlineCode as discordInlineCode,
	italic as discordItalic,
	spoiler as discordSpoiler,
	strikethrough as discordStrikethrough,
	underscore as discordUnderscore
} from 'discord.js';

/**
 * Wraps the content inside a codeblock with no language.
 * @param content The content to wrap.
 */
export function codeBlock(content: string): string;

/**
 * Wraps the content inside a codeblock with the specified language.
 * @param language The language for the codeblock.
 * @param content The content to wrap.
 */
export function codeBlock(language: CodeBlockLang, content: string): string;
export function codeBlock(languageOrContent: string, content?: string): string {
	return typeof content === 'undefined'
		? discordCodeBlock(discordEscapeCodeBlock(`${languageOrContent}`))
		: discordCodeBlock(`${languageOrContent}`, discordEscapeCodeBlock(`${content}`));
}

/**
 * Wraps the content inside \`backticks\`, which formats it as inline code.
 * @param content The content to wrap.
 */
export function inlineCode(content: string): string {
	return discordInlineCode(discordEscapeInlineCode(`${content}`));
}

/**
 * Formats the content into italic text.
 * @param content The content to wrap.
 */
export function italic(content: string): string {
	return discordItalic(discordEscapeItalic(`${content}`));
}

/**
 * Formats the content into bold text.
 * @param content The content to wrap.
 */
export function bold(content: string): string {
	return discordBold(discordEscapeBold(`${content}`));
}

/**
 * Formats the content into underscored text.
 * @param content The content to wrap.
 */
export function underscore(content: string): string {
	return discordUnderscore(discordEscapeUnderline(`${content}`));
}

/**
 * Formats the content into strike-through text.
 * @param content The content to wrap.
 */
export function strikethrough(content: string): string {
	return discordStrikethrough(discordEscapeStrikethrough(`${content}`));
}

/**
 * Wraps the content inside spoiler (hidden text).
 * @param content The content to wrap.
 */
export function spoiler(content: string): string {
	return discordSpoiler(discordEscapeSpoiler(`${content}`));
}

/**
 * Escapes any Discord-flavour markdown in a string.
 * @param text Content to escape
 * @param options Options for escaping the markdown
 */
export function escapeMarkdown(text: string, options?: EscapeMarkdownOptions): string {
	return discordEscapeMarkdown(`${text}`, options);
}

/**
 * Formats input: makes it bold and escapes any other markdown
 * @param text The input
 */
export function input(text: string): string {
	return bold(escapeMarkdown(sanitizeWtlAndControl(`${text}`)));
}

/**
 * Formats input for logs: makes it highlighted
 * @param text The input
 */
export function inputLog(text: string): string {
	return `<<${sanitizeWtlAndControl(`${text}`)}>>`;
}

/**
 * Removes all characters in a string that are either control characters or change the direction of text etc.
 * @param str The string you would like sanitized
 */
export function sanitizeWtlAndControl(str: string) {
	// eslint-disable-next-line no-control-regex
	return `${str}`.replace(/[\u0000-\u001F\u007F-\u009F\u200B]/g, '');
}
