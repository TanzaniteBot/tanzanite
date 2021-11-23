import { type CodeBlockLang } from '#lib';
import { Formatters, Util } from 'discord.js';

/**
 * Formats and escapes content for formatting
 */
export class Format {
	/**
	 * Wraps the content inside a codeblock with no language.
	 * @param content The content to wrap.
	 */
	public static codeBlock(content: string): string;

	/**
	 * Wraps the content inside a codeblock with the specified language.
	 * @param language The language for the codeblock.
	 * @param content The content to wrap.
	 */
	public static codeBlock(language: CodeBlockLang, content: string): string;
	public static codeBlock(languageOrContent: string, content?: string): string {
		return typeof content === 'undefined'
			? Formatters.codeBlock(Util.escapeCodeBlock(languageOrContent))
			: Formatters.codeBlock(languageOrContent, Util.escapeCodeBlock(languageOrContent));
	}

	/**
	 * Wraps the content inside \`backticks\`, which formats it as inline code.
	 * @param content The content to wrap.
	 */
	public static inlineCode(content: string): string {
		return Formatters.inlineCode(Util.escapeInlineCode(content));
	}

	/**
	 * Formats the content into italic text.
	 * @param content The content to wrap.
	 */
	public static italic(content: string): string {
		return Formatters.italic(Util.escapeItalic(content));
	}

	/**
	 * Formats the content into bold text.
	 * @param content The content to wrap.
	 */
	public static bold(content: string): string {
		return Formatters.bold(Util.escapeBold(content));
	}

	/**
	 * Formats the content into underscored text.
	 * @param content The content to wrap.
	 */
	public static underscore(content: string): string {
		return Formatters.underscore(Util.escapeUnderline(content));
	}

	/**
	 * Formats the content into strike-through text.
	 * @param content The content to wrap.
	 */
	public static strikethrough(content: string): string {
		return Formatters.strikethrough(Util.escapeStrikethrough(content));
	}

	/**
	 * Wraps the content inside spoiler (hidden text).
	 * @param content The content to wrap.
	 */
	public static spoiler(content: string): string {
		return Formatters.spoiler(Util.escapeSpoiler(content));
	}
}
