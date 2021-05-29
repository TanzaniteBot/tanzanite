import { TextChannel } from 'discord.js';
import { BushClient } from '../extensions/BushClient';
import chalk from 'chalk';

export class Logger {
	private client: BushClient;
	public constructor(client: BushClient) {
		this.client = client;
	}
	private stripColor(text: string): string {
		return text.replace(
			// eslint-disable-next-line no-control-regex
			/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
			''
		);
	}
	public getChannel(channel: 'log' | 'error' | 'dm'): Promise<TextChannel> {
		return this.client.channels.fetch(this.client.config.channels[channel]) as Promise<TextChannel>;
	}
	public async log(message: string, sendChannel = false): Promise<void> {
		console.log(chalk`{bgCyan LOG} ` + message);
		if (sendChannel) {
			const channel = await this.getChannel('log');
			await channel.send('[LOG] ' + this.stripColor(message));
		}
	}

	public async verbose(message: string, sendChannel = false): Promise<void> {
		if (!this.client.config.logging.verbose) return;
		console.log(chalk`{bgMagenta VERBOSE} ` + message);
		if (sendChannel) {
			const channel = await this.getChannel('log');
			await channel.send('[VERBOSE] ' + this.stripColor(message));
		}
	}
	public async error(message: string, sendChannel = false): Promise<void> {
		console.log(chalk`{bgRed ERROR} ` + message);
		if (sendChannel) {
			const channel = await this.getChannel('error');
			await channel.send('[ERROR] ' + this.stripColor(message));
		}
	}
}
