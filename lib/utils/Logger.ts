import type { TanzaniteClient } from '#lib/extensions/index.js';
import chalk from 'chalk';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { BitField, EmbedBuilder, bold, escapeMarkdown, type Message, type PartialTextBasedChannelFields } from 'discord.js';
import repl, { REPL_MODE_STRICT, type REPLServer } from 'node:repl';
import type { WriteStream } from 'node:tty';
import { stripVTControlCharacters as stripColor } from 'node:util';
import type { SendMessageType } from '../types/misc.js';
import { colors } from './Constants.js';
import { inspect } from './Utils.js';

let REPL: REPLServer;
let replGone = false;

/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
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

	const apply = (stream: WriteStream, symbol: symbol): ProxyHandler<(typeof console)['log']>['apply'] =>
		function apply(target, _thisArg, args) {
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
/* eslint-enable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

/**
 * Parses the content surrounding by `<<>>` and emphasizes it with the given color or by making it bold.
 * @param content The content to parse.
 * @param color The color to emphasize the content with.
 * @param discordFormat Whether or not to format the content for discord.
 * @returns The formatted content.
 */
function parseFormatting<T>(
	content: T,
	color: 'blueBright' | 'blackBright' | 'redBright' | 'yellowBright' | 'greenBright' | '',
	discordFormat = false
): T {
	if (typeof content !== 'string') return content;
	return content
		.split(/<<|>>/)
		.map((value, index) => {
			if (discordFormat) {
				return index % 2 === 0 ? escapeMarkdown(value) : bold(escapeMarkdown(value));
			} else {
				return index % 2 === 0 || !color ? value : chalk[color](value);
			}
		})
		.join('') as T;
}

/**
 * Inspects the content and returns a string.
 * @param content The content to inspect.
 * @param depth The depth the content will inspected. Defaults to `2`.
 * @param colors Whether or not to use colors in the output. Defaults to `true`.
 * @returns The inspected content.
 */
function inspectContent(content: any, depth = 2, colors = true): string {
	if (typeof content !== 'string') {
		return inspect(content, { depth, colors });
	}
	return content;
}

/**
 * Generates a formatted timestamp for logging.
 * @returns The formatted timestamp.
 */
function getTimeStamp(): string {
	const now = new Date();
	const minute = pad(now.getMinutes());
	const hour = pad(now.getHours());
	const date = `${pad(now.getMonth() + 1)}/${pad(now.getDate())}`;
	return `${date} ${hour}:${minute}`;
}

/**
 * Pad a two-digit number.
 */
function pad(num: number) {
	return num.toString().padStart(2, '0');
}

/**
 * The flags representing what forms of the logger are enabled, allows for default logging behavior to be overridden
 * by the config.
 */
export enum LoggingFlags {
	None = 0,
	Info = 1 << 0,
	Success = 1 << 1,
	Error = 1 << 2,
	Warn = 1 << 3,
	Verbose = 1 << 4,
	VeryVerbose = 1 << 5,
	Debug = 1 << 6,
	NoMessage = 1 << 7,
	NoRaw = 1 << 8
}

export type LoggingFlagsKeys = keyof typeof LoggingFlags;

class LoggingBitField extends BitField<LoggingFlagsKeys> {
	public static override Flags = LoggingFlags;
}

/**
 * Custom logging utility for the bot.
 */
export class Logger {
	private flags: LoggingBitField;

	/**
	 * @param client The client.
	 */
	public constructor(public client: TanzaniteClient) {
		let flags = LoggingFlags.None;

		const l = client.config.logging;

		if (l.info) flags |= LoggingFlags.Info;
		if ('success' in l ? (l.success ?? false) : true) flags |= LoggingFlags.Success;
		if ('error' in l ? (l.error ?? false) : true) flags |= LoggingFlags.Error;
		if ('warn' in l ? (l.warn ?? false) : true) flags |= LoggingFlags.Warn;
		if (l.verbose) flags |= LoggingFlags.Verbose;
		if ('veryVerbose' in l ? (l.veryVerbose ?? false) : l.verbose) flags |= LoggingFlags.VeryVerbose;
		if ('debug' in l ? (l.debug ?? false) : client.config.isDevelopment) flags |= LoggingFlags.Debug;
		if ('noMessage' in l ? (l.noMessage ?? false) : false) flags |= LoggingFlags.NoMessage;
		if ('noRaw' in l ? (l.noRaw ?? false) : false) flags |= LoggingFlags.NoRaw;

		this.flags = new LoggingBitField(flags);
	}

	/**
	 * Logs information. Highlight information by surrounding it in `<<>>`.
	 * @param header The header displayed before the content, displayed in cyan.
	 * @param content The content to log, highlights displayed in bright blue.
	 * @param sendChannel Should this also be logged to discord? Defaults to false.
	 * @param depth The depth the content will inspected. Defaults to 0.
	 */
	public get log() {
		return this.info.bind(this);
	}

	/**
	 * Sends a message to the log channel.
	 * @param message The parameter to pass to {@link PartialTextBasedChannelFields.send}.
	 * @returns The message sent.
	 */
	public async channelLog(message: SendMessageType): Promise<Message | null> {
		const channel = await this.client.utils.getConfigChannel('log');
		if (channel === null) return null;
		return await channel.send(message).catch(() => null);
	}

	/**
	 * Sends a message to the error channel.
	 * @param message The parameter to pass to {@link PartialTextBasedChannelFields.send}.
	 * @returns The message sent.
	 */
	public async channelError(message: SendMessageType): Promise<Message | null> {
		const channel = await this.client.utils.getConfigChannel('error');
		if (!channel) {
			void this.error(
				'BushLogger',
				`Could not find error channel, was originally going to send: \n${inspect(message, {
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
	public debug(content: any, depth = 0): void {
		if (!this.flags.has('Debug')) return;
		const newContent = inspectContent(content, depth, true);
		console.log(`${chalk.bgMagenta(getTimeStamp())} ${chalk.magenta('[Debug]')} ${newContent}`);
	}

	/**
	 * Logs raw debug information. Only works in dev is enabled in the config.
	 * @param content The content to log.
	 */
	public debugRaw(...content: any[]): void {
		if (!this.flags.has('Debug') || this.flags.has('NoRaw')) return;
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		console.log(`${chalk.bgMagenta(getTimeStamp())} ${chalk.magenta('[Debug]')}`, ...content);
	}

	/**
	 * Logs verbose information. Highlight information by surrounding it in `<<>>`.
	 * @param header The header printed before the content, displayed in grey.
	 * @param content The content to log, highlights displayed in bright black.
	 * @param sendChannel Should this also be logged to discord? Defaults to `false`.
	 * @param depth The depth the content will inspected. Defaults to `0`.
	 */
	public async verbose(header: string, content: any, sendChannel = false, depth = 0): Promise<void> {
		if (!this.flags.has('Verbose')) return;
		const newContent = inspectContent(content, depth, true);
		console.log(`${chalk.bgGrey(getTimeStamp())} ${chalk.grey(`[${header}]`)} ${parseFormatting(newContent, 'blackBright')}`);

		if (!sendChannel || this.flags.has('NoMessage')) return;
		const embed = new EmbedBuilder()
			.setDescription(`**[${header}]** ${parseFormatting(stripColor(newContent), '', true)}`)
			.setColor(colors.gray)
			.setTimestamp();
		await this.channelLog({ embeds: [embed] });
	}

	/**
	 * Logs very verbose information. Highlight information by surrounding it in `<<>>`.
	 * @param header The header printed before the content, displayed in purple.
	 * @param content The content to log, highlights displayed in bright black.
	 * @param depth The depth the content will inspected. Defaults to `0`.
	 */
	public superVerbose(header: string, content: any, depth = 0): void {
		if (!this.flags.has('VeryVerbose')) return;
		const newContent = inspectContent(content, depth, true);
		console.log(
			`${chalk.bgHex('#949494')(getTimeStamp())} ${chalk.hex('#949494')(`[${header}]`)} ${chalk.hex('#b3b3b3')(newContent)}`
		);
	}

	/**
	 * Logs raw very verbose information.
	 * @param header The header printed before the content, displayed in purple.
	 * @param content The content to log.
	 */
	public superVerboseRaw(header: string, ...content: any[]): void {
		if (!this.flags.has('VeryVerbose') || this.flags.has('NoRaw')) return;
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		console.log(`${chalk.bgHex('#a3a3a3')(getTimeStamp())} ${chalk.hex('#a3a3a3')(`[${header}]`)}`, ...content);
	}

	/**
	 * Logs information. Highlight information by surrounding it in `<<>>`.
	 * @param header The header displayed before the content, displayed in cyan.
	 * @param content The content to log, highlights displayed in bright blue.
	 * @param sendChannel Should this also be logged to discord? Defaults to `false`.
	 * @param depth The depth the content will inspected. Defaults to `0`.
	 */
	public async info(header: string, content: any, sendChannel = true, depth = 0): Promise<void> {
		if (!this.flags.has('Info')) return;
		const newContent = inspectContent(content, depth, true);
		console.log(`${chalk.bgCyan(getTimeStamp())} ${chalk.cyan(`[${header}]`)} ${parseFormatting(newContent, 'blueBright')}`);

		if (!sendChannel || this.flags.has('NoMessage')) return;
		const embed = new EmbedBuilder()
			.setDescription(`**[${header}]** ${parseFormatting(stripColor(newContent), '', true)}`)
			.setColor(colors.info)
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
	public async warn(header: string, content: any, sendChannel = true, depth = 0): Promise<void> {
		if (!this.flags.has('Warn')) return;
		const newContent = inspectContent(content, depth, true);
		console.warn(
			`${chalk.bgYellow(getTimeStamp())} ${chalk.yellow(`[${header}]`)} ${parseFormatting(newContent, 'yellowBright')}`
		);

		if (!sendChannel || this.flags.has('NoMessage')) return;
		const embed = new EmbedBuilder()
			.setDescription(`**[${header}]** ${parseFormatting(stripColor(newContent), '', true)}`)
			.setColor(colors.warn)
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
	public async error(header: string, content: any, sendChannel = true, depth = 0): Promise<void> {
		if (!this.flags.has('Error')) return;
		const newContent = inspectContent(content, depth, true);
		console.warn(
			`${chalk.bgRedBright(getTimeStamp())} ${chalk.redBright(`[${header}]`)} ${parseFormatting(newContent, 'redBright')}`
		);

		if (!sendChannel || this.flags.has('NoMessage')) return;
		const embed = new EmbedBuilder()
			.setDescription(`**[${header}]** ${parseFormatting(stripColor(newContent), '', true)}`)
			.setColor(colors.error)
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
	public async success(header: string, content: any, sendChannel = true, depth = 0): Promise<void> {
		if (!this.flags.has('Success')) return;
		const newContent = inspectContent(content, depth, true);
		console.log(
			`${chalk.bgGreen(getTimeStamp())} ${chalk.greenBright(`[${header}]`)} ${parseFormatting(newContent, 'greenBright')}`
		);

		if (!sendChannel || this.flags.has('NoMessage')) return;
		const embed = new EmbedBuilder()
			.setDescription(`**[${header}]** ${parseFormatting(stripColor(newContent), '', true)}`)
			.setColor(colors.success)
			.setTimestamp();
		await this.channelLog({ embeds: [embed] }).catch(() => {});
	}
}
