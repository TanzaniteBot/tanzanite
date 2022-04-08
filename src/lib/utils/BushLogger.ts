import chalk from 'chalk';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Embed, Util, type Message, type PartialTextBasedChannelFields } from 'discord.js';
import repl, { REPLServer, REPL_MODE_STRICT } from 'repl';
import { WriteStream } from 'tty';
import { inspect } from 'util';
import { type BushSendMessageType } from '../extensions/discord-akairo/BushClient.js';

let REPL: REPLServer;
let replGone = false;

export function init() {
	const kFormatForStdout = Object.getOwnPropertySymbols(console).find((sym) => sym.toString() === 'Symbol(kFormatForStdout)')!;
	const kFormatForStderr = Object.getOwnPropertySymbols(console).find((sym) => sym.toString() === 'Symbol(kFormatForStderr)')!;

	REPL = repl.start({
		useColors: true,
		terminal: true,
		useGlobal: true,
		replMode: REPL_MODE_STRICT,
		breakEvalOnSigint: true,
		ignoreUndefined: true
	});

	const apply = (stream: WriteStream, symbol: symbol): ProxyHandler<typeof console['log']>['apply'] =>
		function apply(target, thisArg, args) {
			if (stream.isTTY) {
				stream.moveCursor(0, -1);
				stream.write('\n');
				stream.clearLine(0);
			}

			const ret = target(...args);

			if (stream.isTTY) {
				const formatted = (console as any)[symbol](args) as string;

				stream.moveCursor(0, formatted.split('\n').length);
				if (!replGone) {
					REPL.displayPrompt(true);
				}
			}

			return ret;
		};

	global.console.log = new Proxy(console.log, {
		apply: apply(process.stdout, kFormatForStdout)
	});

	global.console.warn = new Proxy(console.warn, {
		apply: apply(process.stderr, kFormatForStderr)
	});

	REPL.on('exit', () => {
		replGone = true;
		process.exit(0);
	});
}

/**
 * Custom logging utility for the bot.
 */
export class BushLogger {
	/**
	 * Parses the content surrounding by `<<>>` and emphasizes it with the given color or by making it bold.
	 * @param content The content to parse.
	 * @param color The color to emphasize the content with.
	 * @param discordFormat Whether or not to format the content for discord.
	 * @returns The formatted content.
	 */
	static #parseFormatting(
		content: any,
		color: 'blueBright' | 'blackBright' | 'redBright' | 'yellowBright' | 'greenBright' | '',
		discordFormat = false
	): string | typeof content {
		if (typeof content !== 'string') return content;
		const newContent: Array<string> = content.split(/<<|>>/);
		const tempParsedArray: Array<string> = [];
		newContent.forEach((value, index) => {
			if (index % 2 !== 0) {
				tempParsedArray.push(discordFormat ? `**${Util.escapeMarkdown(value)}**` : color ? chalk[color](value) : value);
			} else {
				tempParsedArray.push(discordFormat ? Util.escapeMarkdown(value) : value);
			}
		});
		return tempParsedArray.join('');
	}

	/**
	 * Inspects the content and returns a string.
	 * @param content The content to inspect.
	 * @param depth The depth the content will inspected. Defaults to `2`.
	 * @param colors Whether or not to use colors in the output. Defaults to `true`.
	 * @returns The inspected content.
	 */
	static #inspectContent(content: any, depth = 2, colors = true): string {
		if (typeof content !== 'string') {
			return inspect(content, { depth, colors });
		}
		return content;
	}

	/**
	 * Strips ANSI color codes from a string.
	 * @param text The string to strip color codes from.
	 * @returns A string without ANSI color codes.
	 */
	static #stripColor(text: string): string {
		return text.replace(
			// eslint-disable-next-line no-control-regex
			/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
			''
		);
	}

	/**
	 * Generates a formatted timestamp for logging.
	 * @returns The formatted timestamp.
	 */
	static #getTimeStamp(): string {
		const now = new Date();
		const hours = now.getHours();
		const minute = now.getMinutes();
		let hour = hours;
		let amOrPm: 'AM' | 'PM' = 'AM';
		if (hour > 12) {
			amOrPm = 'PM';
			hour = hour - 12;
		}
		return `${hour >= 10 ? hour : `0${hour}`}:${minute >= 10 ? minute : `0${minute}`} ${amOrPm}`;
	}

	/**
	 * Logs information. Highlight information by surrounding it in `<<>>`.
	 * @param header The header displayed before the content, displayed in cyan.
	 * @param content The content to log, highlights displayed in bright blue.
	 * @param sendChannel Should this also be logged to discord? Defaults to false.
	 * @param depth The depth the content will inspected. Defaults to 0.
	 */
	public static get log() {
		return BushLogger.info;
	}

	/**
	 * Sends a message to the log channel.
	 * @param message The parameter to pass to {@link PartialTextBasedChannelFields.send}.
	 * @returns The message sent.
	 */
	public static async channelLog(message: BushSendMessageType): Promise<Message | null> {
		const channel = await util.getConfigChannel('log');
		return await channel.send(message).catch(() => null);
	}

	/**
	 * Sends a message to the error channel.
	 * @param message The parameter to pass to {@link PartialTextBasedChannelFields.send}.
	 * @returns The message sent.
	 */
	public static async channelError(message: BushSendMessageType): Promise<Message | null> {
		const channel = await util.getConfigChannel('error');
		if (!channel) {
			void this.error(
				'BushLogger',
				`Could not find error channel, was originally going to send: \n${util.inspect(message, {
					colors: true
				})}\n${new Error().stack?.substring(8)}`,
				false
			);
			return null;
		}
		return await channel.send(message);
	}

	/**
	 * Logs debug information. Only works in dev is enabled in the config.
	 * @param content The content to log.
	 * @param depth The depth the content will inspected. Defaults to `0`.
	 */
	public static debug(content: any, depth = 0): void {
		if (!client.config.isDevelopment) return;
		const newContent = this.#inspectContent(content, depth, true);
		console.log(`${chalk.bgMagenta(this.#getTimeStamp())} ${chalk.magenta('[Debug]')} ${newContent}`);
	}

	/**
	 * Logs raw debug information. Only works in dev is enabled in the config.
	 * @param content The content to log.
	 */
	public static debugRaw(...content: any): void {
		if (!client.config.isDevelopment) return;
		console.log(`${chalk.bgMagenta(this.#getTimeStamp())} ${chalk.magenta('[Debug]')}`, ...content);
	}

	/**
	 * Logs verbose information. Highlight information by surrounding it in `<<>>`.
	 * @param header The header printed before the content, displayed in grey.
	 * @param content The content to log, highlights displayed in bright black.
	 * @param sendChannel Should this also be logged to discord? Defaults to `false`.
	 * @param depth The depth the content will inspected. Defaults to `0`.
	 */
	public static async verbose(header: string, content: any, sendChannel = false, depth = 0): Promise<void> {
		if (!client.config.logging.verbose) return;
		const newContent = this.#inspectContent(content, depth, true);
		console.log(
			`${chalk.bgGrey(this.#getTimeStamp())} ${chalk.grey(`[${header}]`)} ${this.#parseFormatting(newContent, 'blackBright')}`
		);
		if (!sendChannel) return;
		const embed = new Embed()
			.setDescription(`**[${header}]** ${this.#parseFormatting(this.#stripColor(newContent), '', true)}`)
			.setColor(util.colors.gray)
			.setTimestamp();
		await this.channelLog({ embeds: [embed] });
	}

	/**
	 * Logs very verbose information. Highlight information by surrounding it in `<<>>`.
	 * @param header The header printed before the content, displayed in purple.
	 * @param content The content to log, highlights displayed in bright black.
	 * @param depth The depth the content will inspected. Defaults to `0`.
	 */
	public static async superVerbose(header: string, content: any, depth = 0): Promise<void> {
		if (!client.config.logging.verbose) return;
		const newContent = this.#inspectContent(content, depth, true);
		console.log(
			`${chalk.bgHex('#949494')(this.#getTimeStamp())} ${chalk.hex('#949494')(`[${header}]`)} ${chalk.hex('#b3b3b3')(newContent)}`
		);
	}

	/**
	 * Logs raw very verbose information.
	 * @param header The header printed before the content, displayed in purple.
	 * @param content The content to log.
	 */
	public static async superVerboseRaw(header: string, ...content: any[]): Promise<void> {
		if (!client.config.logging.verbose) return;
		console.log(`${chalk.bgHex('#a3a3a3')(this.#getTimeStamp())} ${chalk.hex('#a3a3a3')(`[${header}]`)}`, ...content);
	}

	/**
	 * Logs information. Highlight information by surrounding it in `<<>>`.
	 * @param header The header displayed before the content, displayed in cyan.
	 * @param content The content to log, highlights displayed in bright blue.
	 * @param sendChannel Should this also be logged to discord? Defaults to `false`.
	 * @param depth The depth the content will inspected. Defaults to `0`.
	 */
	public static async info(header: string, content: any, sendChannel = true, depth = 0): Promise<void> {
		if (!client.config.logging.info) return;
		const newContent = this.#inspectContent(content, depth, true);
		console.log(
			`${chalk.bgCyan(this.#getTimeStamp())} ${chalk.cyan(`[${header}]`)} ${this.#parseFormatting(newContent, 'blueBright')}`
		);
		if (!sendChannel) return;
		const embed = new Embed()
			.setDescription(`**[${header}]** ${this.#parseFormatting(this.#stripColor(newContent), '', true)}`)
			.setColor(util.colors.info)
			.setTimestamp();
		await this.channelLog({ embeds: [embed] });
	}

	/**
	 * Logs warnings. Highlight information by surrounding it in `<<>>`.
	 * @param header The header displayed before the content, displayed in yellow.
	 * @param content The content to log, highlights displayed in bright yellow.
	 * @param sendChannel Should this also be logged to discord? Defaults to `false`.
	 * @param depth The depth the content will inspected. Defaults to `0`.
	 */
	public static async warn(header: string, content: any, sendChannel = true, depth = 0): Promise<void> {
		const newContent = this.#inspectContent(content, depth, true);
		console.warn(
			`${chalk.bgYellow(this.#getTimeStamp())} ${chalk.yellow(`[${header}]`)} ${this.#parseFormatting(
				newContent,
				'yellowBright'
			)}`
		);

		if (!sendChannel) return;
		const embed = new Embed()
			.setDescription(`**[${header}]** ${this.#parseFormatting(this.#stripColor(newContent), '', true)}`)
			.setColor(util.colors.warn)
			.setTimestamp();
		await this.channelError({ embeds: [embed] });
	}

	/**
	 * Logs errors. Highlight information by surrounding it in `<<>>`.
	 * @param header The header displayed before the content, displayed in bright red.
	 * @param content The content to log, highlights displayed in bright red.
	 * @param sendChannel Should this also be logged to discord? Defaults to `false`.
	 * @param depth The depth the content will inspected. Defaults to `0`.
	 */
	public static async error(header: string, content: any, sendChannel = true, depth = 0): Promise<void> {
		const newContent = this.#inspectContent(content, depth, true);
		console.warn(
			`${chalk.bgRedBright(this.#getTimeStamp())} ${chalk.redBright(`[${header}]`)} ${this.#parseFormatting(
				newContent,
				'redBright'
			)}`
		);
		if (!sendChannel) return;
		const embed = new Embed()
			.setDescription(`**[${header}]** ${this.#parseFormatting(this.#stripColor(newContent), '', true)}`)
			.setColor(util.colors.error)
			.setTimestamp();
		await this.channelError({ embeds: [embed] });
		return;
	}

	/**
	 * Logs successes. Highlight information by surrounding it in `<<>>`.
	 * @param header The header displayed before the content, displayed in green.
	 * @param content The content to log, highlights displayed in bright green.
	 * @param sendChannel Should this also be logged to discord? Defaults to `false`.
	 * @param depth The depth the content will inspected. Defaults to `0`.
	 */
	public static async success(header: string, content: any, sendChannel = true, depth = 0): Promise<void> {
		const newContent = this.#inspectContent(content, depth, true);
		console.log(
			`${chalk.bgGreen(this.#getTimeStamp())} ${chalk.greenBright(`[${header}]`)} ${this.#parseFormatting(
				newContent,
				'greenBright'
			)}`
		);
		if (!sendChannel) return;
		const embed = new Embed()
			.setDescription(`**[${header}]** ${this.#parseFormatting(this.#stripColor(newContent), '', true)}`)
			.setColor(util.colors.success)
			.setTimestamp();
		await this.channelLog({ embeds: [embed] }).catch(() => {});
	}
}

/** @typedef {PartialTextBasedChannelFields} vscodeDontDeleteMyImportTy */
