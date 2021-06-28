/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import chalk from 'chalk';
import { MessageEmbed } from 'discord.js';
import { inspect } from 'util';
import { BushClient, BushSendMessageType } from '../extensions/BushClient';

export class BushLogger {
	private client: BushClient;
	public constructor(client: BushClient) {
		this.client = client;
	}

	private parseFormatting(
		content: any,
		color: 'blueBright' | 'blackBright' | 'redBright' | 'yellowBright' | 'greenBright' | '',
		discordFormat = false
	): string | typeof content {
		if (typeof content !== 'string') return content;
		const newContent: Array<string> = content.split(/<<|>>/);
		const tempParsedArray: Array<string> = [];
		newContent.forEach((value, index) => {
			if (index % 2 !== 0) {
				tempParsedArray.push(discordFormat ? `**${value}**` : chalk[color](value));
			} else {
				tempParsedArray.push(value);
			}
		});
		return tempParsedArray.join('');
	}

	private inspectContent(content: any, depth = 2): string {
		if (typeof content !== 'string') {
			return inspect(content, { depth });
		}
		return content;
	}

	private stripColor(text: string): string {
		return text.replace(
			// eslint-disable-next-line no-control-regex
			/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
			''
		);
	}

	private getTimeStamp(): string {
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
	 * @param header - The header displayed before the content, displayed in cyan.
	 * @param content - The content to log, highlights displayed in bright blue.
	 * @param sendChannel - Should this also be logged to discord? Defaults to true.
	 */
	public get log() {
		return this.info;
	}

	/** Sends a message to the log channel */
	public async channelLog(message: BushSendMessageType): Promise<void> {
		const channel = await this.client.util.getConfigChannel('log');
		await channel.send(message).catch(() => {});
	}

	/** Sends a message to the error channel */
	public async channelError(message: BushSendMessageType): Promise<void> {
		const channel = await this.client.util.getConfigChannel('error');
		await channel.send(message).catch(() => {});
	}

	/**
	 * Logs debug information. Only works in dev is enabled in the config.
	 * @param content - The content to log.
	 */
	public debug(...content: any): void {
		if (!this.client.config.dev) return;
		console.log(`${chalk.bgMagenta(this.getTimeStamp())} ${chalk.magenta('[Debug]')}`, ...content);
	}

	/**
	 * Logs verbose information. Highlight information by surrounding it in `<<>>`.
	 * @param header - The header printed before the content, displayed in grey.
	 * @param content - The content to log, highlights displayed in bright black.
	 * @param sendChannel = false - Should this also be logged to discord? Defaults to false.
	 */
	public async verbose(header: string, content: any, sendChannel = false): Promise<void> {
		if (!this.client.config.logging.verbose) return;
		const newContent = this.inspectContent(content);
		console.info(
			`${chalk.bgGrey(this.getTimeStamp())} ${chalk.grey(`[${header}]`)} ` + this.parseFormatting(newContent, 'blackBright')
		);
		if (!sendChannel) return;
		const embed = new MessageEmbed()
			.setDescription(`**[${header}]** ${this.parseFormatting(this.stripColor(newContent), '', true)}`)
			.setColor(this.client.util.colors.gray)
			.setTimestamp();
		await this.channelLog({ embeds: [embed] });
	}

	/**
	 * Logs information. Highlight information by surrounding it in `<<>>`.
	 * @param header - The header displayed before the content, displayed in cyan.
	 * @param content - The content to log, highlights displayed in bright blue.
	 * @param sendChannel - Should this also be logged to discord? Defaults to true.
	 */
	public async info(header: string, content: any, sendChannel = true): Promise<void> {
		if (!this.client.config.logging.info) return;
		const newContent = this.inspectContent(content);
		console.info(
			`${chalk.bgCyan(this.getTimeStamp())} ${chalk.cyan(`[${header}]`)} ` + this.parseFormatting(newContent, 'blueBright')
		);
		if (!sendChannel) return;
		const embed = new MessageEmbed()
			.setDescription(`**[${header}]** ${this.parseFormatting(this.stripColor(newContent), '', true)}`)
			.setColor(this.client.util.colors.info)
			.setTimestamp();
		await this.channelLog({ embeds: [embed] });
	}

	/**
	 * Logs warnings. Highlight information by surrounding it in `<<>>`.
	 * @param header - The header displayed before the content, displayed in yellow.
	 * @param content - The content to log, highlights displayed in bright yellow.
	 * @param sendChannel - Should this also be logged to discord? Defaults to true.
	 */
	public async warn(header: string, content: any, sendChannel = true): Promise<void> {
		const newContent = this.inspectContent(content);
		console.warn(
			`${chalk.bgYellow(this.getTimeStamp())} ${chalk.yellow(`[${header}]`)} ` +
				this.parseFormatting(newContent, 'yellowBright')
		);

		if (!sendChannel) return;
		const embed = new MessageEmbed()
			.setDescription(`**[${header}]** ${this.parseFormatting(this.stripColor(newContent), '', true)}`)
			.setColor(this.client.util.colors.warn)
			.setTimestamp();
		await this.channelLog({ embeds: [embed] });
	}

	/**
	 * Logs errors. Highlight information by surrounding it in `<<>>`.
	 * @param header - The header displayed before the content, displayed in bright red.
	 * @param content - The content to log, highlights displayed in bright red.
	 * @param sendChannel - Should this also be logged to discord? Defaults to true.
	 */
	public async error(header: string, content: any, sendChannel = true): Promise<void> {
		const newContent = this.inspectContent(content);
		console.error(
			`${chalk.bgRedBright(this.getTimeStamp())} ${chalk.redBright(`[${header}]`)} ` +
				this.parseFormatting(newContent, 'redBright')
		);
		if (!sendChannel) return;
		const embed = new MessageEmbed()
			.setDescription(`**[${header}]** ${this.parseFormatting(this.stripColor(newContent), '', true)}`)
			.setColor(this.client.util.colors.error)
			.setTimestamp();
		await this.channelError({ embeds: [embed] });
	}

	/**
	 * Logs successes. Highlight information by surrounding it in `<<>>`.
	 * @param header - The header displayed before the content, displayed in green.
	 * @param content - The content to log, highlights displayed in bright green.
	 * @param sendChannel - Should this also be logged to discord? Defaults to true.
	 */
	public async success(header: string, content: any, sendChannel = true): Promise<void> {
		const newContent = this.inspectContent(content);
		console.log(
			`${chalk.bgGreen(this.getTimeStamp())} ${chalk.greenBright(`[${header}]`)} ` +
				this.parseFormatting(newContent, 'greenBright')
		);
		if (!sendChannel) return;
		const embed = new MessageEmbed()
			.setDescription(`**[${header}]** ${this.parseFormatting(this.stripColor(newContent), '', true)}`)
			.setColor(this.client.util.colors.success)
			.setTimestamp();
		await this.channelLog({ embeds: [embed] }).catch(() => {});
	}
}
