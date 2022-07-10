import assert from 'assert';
import {
	cleanCodeBlockContent,
	DMChannel,
	escapeCodeBlock,
	GuildMember,
	Message,
	PartialDMChannel,
	Routes,
	TextBasedChannel,
	ThreadMember,
	User,
	type APIMessage,
	type Client,
	type Snowflake,
	type UserResolvable
} from 'discord.js';
import got from 'got';
import _ from 'lodash';
import { ConfigChannelKey } from '../../../config/Config.js';
import CommandErrorListener from '../../listeners/commands/commandError.js';
import { BushInspectOptions } from '../common/typings/BushInspectOptions.js';
import { CodeBlockLang } from '../common/typings/CodeBlockLang.js';
import { CommandMessage } from '../extensions/discord-akairo/BushCommand.js';
import { SlashMessage } from '../extensions/discord-akairo/SlashMessage.js';
import { Global } from '../models/shared/Global.js';
import { Shared } from '../models/shared/Shared.js';
import { GlobalCache, SharedCache } from './BushCache.js';
import { emojis, Pronoun, PronounCode, pronounMapping, regex } from './BushConstants.js';
import { addOrRemoveFromArray, formatError, inspect } from './BushUtils.js';

/**
 * Utilities that require access to the client.
 */
export class BushClientUtils {
	/**
	 * The hastebin urls used to post to hastebin, attempts to post in order
	 */
	#hasteURLs: string[] = [
		'https://hst.sh',
		// 'https://hasteb.in',
		'https://hastebin.com',
		'https://mystb.in',
		'https://haste.clicksminuteper.net',
		'https://paste.pythondiscord.com',
		'https://haste.unbelievaboat.com'
		// 'https://haste.tyman.tech'
	];

	public constructor(private readonly client: Client) {}

	/**
	 * Maps an array of user ids to user objects.
	 * @param ids The list of IDs to map
	 * @returns The list of users mapped
	 */
	public async mapIDs(ids: Snowflake[]): Promise<User[]> {
		return await Promise.all(ids.map((id) => this.client.users.fetch(id)));
	}

	/**
	 * Posts text to hastebin
	 * @param content The text to post
	 * @returns The url of the posted text
	 */
	public async haste(content: string, substr = false): Promise<HasteResults> {
		let isSubstr = false;
		if (content.length > 400_000 && !substr) {
			void this.handleError('haste', new Error(`content over 400,000 characters (${content.length.toLocaleString()})`));
			return { error: 'content too long' };
		} else if (content.length > 400_000) {
			content = content.substring(0, 400_000);
			isSubstr = true;
		}
		for (const url of this.#hasteURLs) {
			try {
				const res: HastebinRes = await got.post(`${url}/documents`, { body: content }).json();
				return { url: `${url}/${res.key}`, error: isSubstr ? 'substr' : undefined };
			} catch {
				void this.client.console.error('haste', `Unable to upload haste to ${url}`);
			}
		}
		return { error: 'unable to post' };
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
				return await this.client.users.fetch(text as Snowflake);
			} catch {}
		}
		const mentionReg = /<@!?(?<id>\d{17,19})>/;
		const mentionMatch = text.match(mentionReg);
		if (mentionMatch) {
			try {
				return await this.client.users.fetch(mentionMatch.groups!.id as Snowflake);
			} catch {}
		}
		const user = this.client.users.cache.find((u) => u.username === text);
		if (user) return user;
		return null;
	}

	/**
	 * Surrounds text in a code block with the specified language and puts it in a hastebin if its too long.
	 * * Embed Description Limit = 4096 characters
	 * * Embed Field Limit = 1024 characters
	 * @param code The content of the code block.
	 * @param length The maximum length of the code block.
	 * @param language The language of the code.
	 * @param substr Whether or not to substring the code if it is too long.
	 * @returns	The generated code block
	 */
	public async codeblock(code: string, length: number, language: CodeBlockLang | '' = '', substr = false): Promise<string> {
		let hasteOut = '';
		code = escapeCodeBlock(code);
		const prefix = `\`\`\`${language}\n`;
		const suffix = '\n```';
		if (code.length + (prefix + suffix).length >= length) {
			const haste_ = await this.haste(code, substr);
			hasteOut = `Too large to display. ${
				haste_.url
					? `Hastebin: ${haste_.url}${language ? `.${language}` : ''}${haste_.error ? ` - ${haste_.error}` : ''}`
					: `${emojis.error} Hastebin: ${haste_.error}`
			}`;
		}

		const FormattedHaste = hasteOut.length ? `\n${hasteOut}` : '';
		const shortenedCode = hasteOut ? code.substring(0, length - (prefix + FormattedHaste + suffix).length) : code;
		const code3 = code.length ? prefix + shortenedCode + suffix + FormattedHaste : prefix + suffix;
		if (code3.length > length) {
			void this.client.console.warn(`codeblockError`, `Required Length: ${length}. Actual Length: ${code3.length}`, true);
			void this.client.console.warn(`codeblockError`, code3, true);
			throw new Error('code too long');
		}
		return code3;
	}

	/**
	 * Maps the key of a credential with a readable version when redacting.
	 * @param key The key of the credential.
	 * @returns The readable version of the key or the original key if there isn't a mapping.
	 */
	#mapCredential(key: string): string {
		return (
			{
				token: 'Main Token',
				devToken: 'Dev Token',
				betaToken: 'Beta Token',
				hypixelApiKey: 'Hypixel Api Key',
				wolframAlphaAppId: 'Wolfram|Alpha App ID',
				dbPassword: 'Database Password'
			}[key] ?? key
		);
	}

	/**
	 * Redacts credentials from a string.
	 * @param text The text to redact credentials from.
	 * @returns The redacted text.
	 */
	public redact(text: string) {
		for (const credentialName in { ...this.client.config.credentials, dbPassword: this.client.config.db.password }) {
			const credential = { ...this.client.config.credentials, dbPassword: this.client.config.db.password }[
				credentialName as keyof typeof this.client.config.credentials
			];
			if (credential === null || credential === '') continue;
			const replacement = this.#mapCredential(credentialName);
			const escapeRegex = /[.*+?^${}()|[\]\\]/g;
			text = text.replace(new RegExp(credential.toString().replace(escapeRegex, '\\$&'), 'g'), `[${replacement} Omitted]`);
			text = text.replace(
				new RegExp([...credential.toString()].reverse().join('').replace(escapeRegex, '\\$&'), 'g'),
				`[${replacement} Omitted]`
			);
		}
		return text;
	}

	/**
	 * Takes an any value, inspects it, redacts credentials, and puts it in a codeblock
	 * (and uploads to hast if the content is too long).
	 * @param input The object to be inspect, redacted, and put into a codeblock.
	 * @param language The language to make the codeblock.
	 * @param inspectOptions The options for {@link BushClientUtil.inspect}.
	 * @param length The maximum length that the codeblock can be.
	 * @returns The generated codeblock.
	 */
	public async inspectCleanRedactCodeblock(
		input: any,
		language?: CodeBlockLang | '',
		inspectOptions?: BushInspectOptions,
		length = 1024
	) {
		input = inspect(input, inspectOptions ?? undefined);
		if (inspectOptions) inspectOptions.inspectStrings = undefined;
		input = cleanCodeBlockContent(input);
		input = this.redact(input);
		return this.codeblock(input, length, language, true);
	}

	/**
	 * Takes an any value, inspects it, redacts credentials, and uploads it to haste.
	 * @param input The object to be inspect, redacted, and upload.
	 * @param inspectOptions The options for {@link BushClientUtil.inspect}.
	 * @returns The {@link HasteResults}.
	 */
	public async inspectCleanRedactHaste(input: any, inspectOptions?: BushInspectOptions): Promise<HasteResults> {
		input = inspect(input, inspectOptions ?? undefined);
		input = this.redact(input);
		return this.haste(input, true);
	}

	/**
	 * Takes an any value, inspects it and redacts credentials.
	 * @param input The object to be inspect and redacted.
	 * @param inspectOptions The options for {@link BushClientUtil.inspect}.
	 * @returns The redacted and inspected object.
	 */
	public inspectAndRedact(input: any, inspectOptions?: BushInspectOptions): string {
		input = inspect(input, inspectOptions ?? undefined);
		return this.redact(input);
	}

	/**
	 * Get the global cache.
	 */
	public getGlobal(): GlobalCache;
	/**
	 * Get a key from the global cache.
	 * @param key The key to get in the global cache.
	 */
	public getGlobal<K extends keyof GlobalCache>(key: K): GlobalCache[K];
	public getGlobal(key?: keyof GlobalCache) {
		return key ? this.client.cache.global[key] : this.client.cache.global;
	}

	/**
	 * Get the shared cache.
	 */
	public getShared(): SharedCache;
	/**
	 * Get a key from the shared cache.
	 * @param key The key to get in the shared cache.
	 */
	public getShared<K extends keyof SharedCache>(key: K): SharedCache[K];
	public getShared(key?: keyof SharedCache) {
		return key ? this.client.cache.shared[key] : this.client.cache.shared;
	}

	/**
	 * Add or remove an element from an array stored in the Globals database.
	 * @param action Either `add` or `remove` an element.
	 * @param key The key of the element in the global cache to update.
	 * @param value The value to add/remove from the array.
	 */
	public async insertOrRemoveFromGlobal<K extends keyof Client['cache']['global']>(
		action: 'add' | 'remove',
		key: K,
		value: Client['cache']['global'][K][0]
	): Promise<Global | void> {
		const row =
			(await Global.findByPk(this.client.config.environment)) ??
			(await Global.create({ environment: this.client.config.environment }));
		const oldValue: any[] = row[key];
		const newValue = addOrRemoveFromArray(action, oldValue, value);
		row[key] = newValue;
		this.client.cache.global[key] = newValue;
		return await row.save().catch((e) => this.handleError('insertOrRemoveFromGlobal', e));
	}

	/**
	 * Add or remove an element from an array stored in the Shared database.
	 * @param action Either `add` or `remove` an element.
	 * @param key The key of the element in the shared cache to update.
	 * @param value The value to add/remove from the array.
	 */
	public async insertOrRemoveFromShared<K extends Exclude<keyof Client['cache']['shared'], 'badWords' | 'autoBanCode'>>(
		action: 'add' | 'remove',
		key: K,
		value: Client['cache']['shared'][K][0]
	): Promise<Shared | void> {
		const row = (await Shared.findByPk(0)) ?? (await Shared.create());
		const oldValue: any[] = row[key];
		const newValue = addOrRemoveFromArray(action, oldValue, value);
		row[key] = newValue;
		this.client.cache.shared[key] = newValue;
		return await row.save().catch((e) => this.handleError('insertOrRemoveFromShared', e));
	}

	/**
	 * Updates an element in the Globals database.
	 * @param key The key in the global cache to update.
	 * @param value The value to set the key to.
	 */
	public async setGlobal<K extends keyof Client['cache']['global']>(
		key: K,
		value: Client['cache']['global'][K]
	): Promise<Global | void> {
		const row =
			(await Global.findByPk(this.client.config.environment)) ??
			(await Global.create({ environment: this.client.config.environment }));
		row[key] = value;
		this.client.cache.global[key] = value;
		return await row.save().catch((e) => this.handleError('setGlobal', e));
	}

	/**
	 * Updates an element in the Shared database.
	 * @param key The key in the shared cache to update.
	 * @param value The value to set the key to.
	 */
	public async setShared<K extends Exclude<keyof Client['cache']['shared'], 'badWords' | 'autoBanCode'>>(
		key: K,
		value: Client['cache']['shared'][K]
	): Promise<Shared | void> {
		const row = (await Shared.findByPk(0)) ?? (await Shared.create());
		row[key] = value;
		this.client.cache.shared[key] = value;
		return await row.save().catch((e) => this.handleError('setShared', e));
	}

	/**
	 * Send a message in the error logging channel and console for an error.
	 * @param context
	 * @param error
	 */
	public async handleError(context: string, error: Error) {
		await this.client.console.error(_.camelCase(context), `An error occurred:\n${formatError(error, false)}`, false);
		await this.client.console.channelError({
			embeds: await CommandErrorListener.generateErrorEmbed(this.client, { type: 'unhandledRejection', error: error, context })
		});
	}

	/**
	 * Fetches a user from discord.
	 * @param user The user to fetch
	 * @returns Undefined if the user is not found, otherwise the user.
	 */
	public async resolveNonCachedUser(user: UserResolvable | undefined | null): Promise<User | undefined> {
		if (user == null) return undefined;
		const resolvedUser =
			user instanceof User
				? user
				: user instanceof GuildMember
				? user.user
				: user instanceof ThreadMember
				? user.user
				: user instanceof Message
				? user.author
				: undefined;

		return resolvedUser ?? (await this.client.users.fetch(user as Snowflake).catch(() => undefined));
	}

	/**
	 * Get the pronouns of a discord user from pronoundb.org
	 * @param user The user to retrieve the promises of.
	 * @returns The human readable pronouns of the user, or undefined if they do not have any.
	 */
	public async getPronounsOf(user: User | Snowflake): Promise<Pronoun | undefined> {
		const _user = await this.resolveNonCachedUser(user);
		if (!_user) throw new Error(`Cannot find user ${user}`);
		const apiRes = (await got
			.get(`https://pronoundb.org/api/v1/lookup?platform=discord&id=${_user.id}`)
			.json()
			.catch(() => undefined)) as { pronouns: PronounCode } | undefined;

		if (!apiRes) return undefined;
		assert(apiRes.pronouns);

		return pronounMapping[apiRes.pronouns!]!;
	}

	/**
	 * Uploads an image to imgur.
	 * @param image The image to upload.
	 * @returns The url of the imgur.
	 */
	public async uploadImageToImgur(image: string) {
		const clientId = this.client.config.credentials.imgurClientId;

		const resp = (await got
			.post('https://api.imgur.com/3/upload', {
				headers: {
					Authorization: `Client-ID ${clientId}`,
					Accept: 'application/json'
				},
				form: {
					image: image,
					type: 'base64'
				},
				followRedirect: true
			})
			.json()) as { data: { link: string } };

		return resp.data.link;
	}

	/**
	 * Gets the prefix based off of the message.
	 * @param message The message to get the prefix from.
	 * @returns The prefix.
	 */
	public prefix(message: CommandMessage | SlashMessage): string {
		return message.util.isSlash
			? '/'
			: this.client.config.isDevelopment
			? 'dev '
			: message.util.parsed?.prefix ?? this.client.config.prefix;
	}

	public async resolveMessageLinks(content: string | null): Promise<MessageLinkParts[]> {
		const res: MessageLinkParts[] = [];

		if (!content) return res;

		const regex_ = new RegExp(regex.messageLink);
		let match: RegExpExecArray | null;
		while (((match = regex_.exec(content)), match !== null)) {
			const input = match.input;
			if (!match.groups || !input) continue;
			if (input.startsWith('<') && input.endsWith('>')) continue;

			const { guild_id, channel_id, message_id } = match.groups;
			if (!guild_id || !channel_id || !message_id) continue;

			res.push({ guild_id, channel_id, message_id });
		}

		return res;
	}

	public async resolveMessagesFromLinks(content: string): Promise<APIMessage[]> {
		const res: APIMessage[] = [];

		const links = await this.resolveMessageLinks(content);
		if (!links.length) return [];

		for (const { guild_id, channel_id, message_id } of links) {
			const guild = this.client.guilds.cache.get(guild_id);
			if (!guild) continue;
			const channel = guild.channels.cache.get(channel_id);
			if (!channel || (!channel.isTextBased() && !channel.isThread())) continue;

			const message = (await this.client.rest
				.get(Routes.channelMessage(channel_id, message_id))
				.catch(() => null)) as APIMessage | null;
			if (!message) continue;

			res.push(message);
		}

		return res;
	}

	/**
	 * Resolves a channel from the config and ensures it is a non-dm-based-text-channel.
	 * @param channel The channel to retrieve.
	 */
	public async getConfigChannel(
		channel: ConfigChannelKey
	): Promise<Exclude<TextBasedChannel, DMChannel | PartialDMChannel> | null> {
		const channels = this.client.config.channels;
		if (!(channel in channels))
			throw new TypeError(`Invalid channel provided (${channel}), must be one of ${Object.keys(channels).join(' ')}`);

		const channelId = channels[channel];
		if (channelId === '') return null;

		const res = await this.client.channels.fetch(channelId);

		if (!res?.isTextBased() || res.isDMBased()) return null;

		return res;
	}
}

interface HastebinRes {
	key: string;
}

export interface HasteResults {
	url?: string;
	error?: 'content too long' | 'substr' | 'unable to post';
}

export interface MessageLinkParts {
	guild_id: Snowflake;
	channel_id: Snowflake;
	message_id: Snowflake;
}
