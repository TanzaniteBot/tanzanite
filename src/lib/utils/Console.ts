/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import chalk from 'chalk';
import { BushClient } from '../extensions/BushClient';

export class Log {
	client: BushClient;

	public constructor(client: BushClient) {
		this.client = client;
	}

	private parseColors(
		content: any,
		color: 'blueBright' | 'blackBright' | 'redBright' | 'yellowBright' | 'greenBright'
	): string | any {
		if (typeof content === 'string') {
			const newContent: Array<string> = content.split(/<<|>>/);
			const tempParsedArray: Array<string> = [];
			newContent.forEach((value, index) => {
				if (index % 2 !== 0) {
					tempParsedArray.push(chalk[color](value));
				} else {
					tempParsedArray.push(value);
				}
			});
			return tempParsedArray.join('');
		} else {
			return content;
		}
	}

	private timeStamp(): string {
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
	 * Logs debug information. Only works in dev is enabled in the config.
	 * @param content - The content to log.
	 */
	public debug(...content: any): void {
		if (this.client.config.dev) {
			console.log(`${chalk.bgGrey(this.timeStamp())} ${chalk.grey('[Debug]')}`, ...content);
		}
	}

	/**
	 * Logs verbose information. Highlight information by surrounding it in `<<>>`.
	 * @param header - The header displayed before the content, displayed in grey.
	 * @param content - The content to log, highlights displayed in bright black.
	 */
	public verbose(header: string, content: any): void {
		if (this.client.config.logging.verbose) {
			return console.info(
				`${chalk.bgGrey(this.timeStamp())} ${chalk.grey(`[${header}]`)} ` + this.parseColors(content, 'blackBright')
			);
		}
	}

	/**
	 * Logs information. Highlight information by surrounding it in `<<>>`.
	 * @param header - The header displayed before the content, displayed in cyan.
	 * @param content - The content to log, highlights displayed in bright blue.
	 */
	public info(header: string, content: any): void {
		if (this.client.config.logging.info) {
			return console.info(
				`${chalk.bgCyan(this.timeStamp())} ${chalk.cyan(`[${header}]`)} ` + this.parseColors(content, 'blueBright')
			);
		}
	}

	/**
	 * Logs warnings. Highlight information by surrounding it in `<<>>`.
	 * @param header - The header displayed before the content, displayed in yellow.
	 * @param content - The content to log, highlights displayed in bright yellow.
	 */
	public warn(header: string, content: any): void {
		return console.warn(
			`${chalk.bgYellow(this.timeStamp())} ${chalk.yellow(`[${header}]`)} ` + this.parseColors(content, 'yellowBright')
		);
	}

	/**
	 * Logs errors. Highlight information by surrounding it in `<<>>`.
	 * @param header - The header displayed before the content, displayed in bright red.
	 * @param content - The content to log, highlights displayed in bright red.
	 */
	public error(header: string, content: any): void {
		return console.error(
			`${chalk.bgRedBright(this.timeStamp())} ${chalk.redBright(`[${header}]`)} ` + this.parseColors(content, 'redBright')
		);
	}

	/**
	 * Logs successes. Highlight information by surrounding it in `<<>>`.
	 * @param header - The header displayed before the content, displayed in green.
	 * @param content - The content to log, highlights displayed in bright green.
	 */
	public success(header: string, content: any): void {
		return console.log(
			`${chalk.bgGreen(this.timeStamp())} ${chalk.greenBright(`[${header}]`)} ` + this.parseColors(content, 'greenBright')
		);
	}
}
