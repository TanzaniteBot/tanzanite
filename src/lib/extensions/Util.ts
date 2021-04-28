import { ClientUtil } from 'discord-akairo';
import { BotClient } from './BotClient';
import { User } from 'discord.js';
import { promisify } from 'util';
import { exec } from 'child_process';
import got from 'got';
import { TextChannel } from 'discord.js';

interface hastebinRes {
	key: string;
}

export class Util extends ClientUtil {
	/**
	 * The client of this ClientUtil
	 * @type {BotClient}
	 */
	public client: BotClient;
	/**
	 * The hastebin urls used to post to hastebin, attempts to post in order
	 * @type {string[]}
	 */
	public hasteURLs = [
		'https://hst.sh',
		'https://hasteb.in',
		'https://hastebin.com',
		'https://mystb.in',
		'https://haste.clicksminuteper.net',
		'https://paste.pythondiscord.com',
		'https://haste.unbelievaboat.com',
		'https://haste.tyman.tech'
	];
	/**
	 * A simple promise exec method
	 */
	private exec = promisify(exec);

	/**
	 * Creates this client util
	 * @param client The client to initialize with
	 */
	constructor(client: BotClient) {
		super(client);
	}

	/**
	 * Maps an array of user ids to user objects.
	 * @param ids The list of IDs to map
	 * @returns The list of users mapped
	 */
	public async mapIDs(ids: string[]): Promise<User[]> {
		return await Promise.all(ids.map((id) => this.client.users.fetch(id)));
	}

	/**
	 * Capitalizes the first letter of the given text
	 * @param text The text to capitalize
	 * @returns The capitalized text
	 */
	public capitalize(text: string): string {
		return text.charAt(0).toUpperCase() + text.slice(1);
	}

	/**
	 * Runs a shell command and gives the output
	 * @param command The shell command to run
	 * @returns The stdout and stderr of the shell command
	 */
	public async shell(
		command: string
	): Promise<{
		stdout: string;
		stderr: string;
	}> {
		return await this.exec(command);
	}

	/**
	 * Posts text to hastebin
	 * @param content The text to post
	 * @returns The url of the posted text
	 */
	public async haste(content: string): Promise<string> {
		for (const url of this.hasteURLs) {
			try {
				const res: hastebinRes = await got
					.post(`${url}/documents`, { body: content })
					.json();
				return `${url}/${res.key}`;
			} catch (e) {
				// pass
			}
		}
		throw new Error('No urls worked. (wtf)');
	}

	/**
	 * Logs something but only in dev mode
	 * @param content The thing to log
	 */
	public devLog(content: unknown): void {
		if (this.client.config.dev) console.log(content);
	}

	/**
	 * Resolves a user-provided string into a user object, if possible
	 * @param text The text to try and resolve
	 * @returns The user resolved or null
	 */
	public async resolveUserAsync(text: string): Promise<User | null> {
		const idReg = /\d{17,19}/;
		const idMatch = text.match(idReg);
		if (idMatch) {
			try {
				const user = await this.client.users.fetch(text);
				return user;
			} catch {
				// pass
			}
		}
		const mentionReg = /<@!?(?<id>\d{17,19})>/;
		const mentionMatch = text.match(mentionReg);
		if (mentionMatch) {
			try {
				const user = await this.client.users.fetch(mentionMatch.groups.id);
				return user;
			} catch {
				// pass
			}
		}
		const user = this.client.users.cache.find((u) => u.username === text);
		if (user) return user;
		return null;
	}

	/**
	 * Appends the correct ordinal to the given number
	 * @param n The number to append an ordinal to
	 * @returns The number with the ordinal
	 */
	public ordinal(n: number): string {
		const s = ['th', 'st', 'nd', 'rd'],
			v = n % 100;
		return n + (s[(v - 20) % 10] || s[v] || s[0]);
	}

	/**
	 * Chunks an array to the specified size
	 * @param arr The array to chunk
	 * @param perChunk The amount of items per chunk
	 * @returns The chunked array
	 */
	public chunk<T>(arr: T[], perChunk: number): T[][] {
		return arr.reduce((all, one, i) => {
			const ch = Math.floor(i / perChunk);
			all[ch] = [].concat(all[ch] || [], one);
			return all;
		}, []);
	}

	/**
	 * Logs a message to console and log channel as info
	 * @param message The message to send
	 */
	public async info(message: string): Promise<void> {
		console.log(`INFO: ${message}`);
		const channel = (await this.client.channels.fetch(
			this.client.config.channels.log
		)) as TextChannel;
		await channel.send(`INFO: ${message}`);
	}

	/**
	 * Logs a message to console and log channel as a warning
	 * @param message The message to send
	 */
	public async warn(message: string): Promise<void> {
		console.warn(`WARN: ${message}`);
		const channel = (await this.client.channels.fetch(
			this.client.config.channels.log
		)) as TextChannel;
		await channel.send(`WARN: ${message}`);
	}

	/**
	 * Logs a message to console and log channel as an error
	 * @param message The message to send
	 */
	public async error(message: string): Promise<void> {
		console.error(`ERROR: ${message}`);
		const channel = (await this.client.channels.fetch(
			this.client.config.channels.error
		)) as TextChannel;
		await channel.send(`ERROR: ${message}`);
	}
}
