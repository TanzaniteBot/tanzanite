import {
	BushCache,
	BushClient,
	BushConstants,
	BushMessage,
	BushSlashMessage,
	BushUser,
	Global,
	Pronoun,
	PronounCode
} from '@lib';
import { exec } from 'child_process';
import { ClientUtil, Util as AkairoUtil } from 'discord-akairo';
import { APIMessage } from 'discord-api-types';
import {
	ColorResolvable,
	CommandInteraction,
	GuildMember,
	InteractionReplyOptions,
	Message,
	MessageEmbed,
	PermissionResolvable,
	Snowflake,
	TextChannel,
	ThreadMember,
	User,
	UserResolvable,
	Util as DiscordUtil
} from 'discord.js';
import got from 'got';
import humanizeDuration from 'humanize-duration';
import _ from 'lodash';
import moment from 'moment';
import { inspect, promisify } from 'util';
import CommandErrorListener from '../../../listeners/commands/commandError';
import { Format } from '../../common/Format';
import { BushInspectOptions } from '../../common/typings/BushInspectOptions';
import { CodeBlockLang } from '../../common/typings/CodeBlockLang';
import { Arg } from '../../common/util/Arg';
import { BushNewsChannel } from '../discord.js/BushNewsChannel';
import { BushTextChannel } from '../discord.js/BushTextChannel';
import { BushSlashEditMessageType, BushSlashSendMessageType, BushUserResolvable } from './BushClient';

export class BushClientUtil extends ClientUtil {
	/**
	 * The client.
	 */
	public declare readonly client: BushClient;

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

	/**
	 * Creates this client util
	 * @param client The client to initialize with
	 */
	public constructor(client: BushClient) {
		super(client);
	}

	/**
	 * Maps an array of user ids to user objects.
	 * @param ids The list of IDs to map
	 * @returns The list of users mapped
	 */
	public async mapIDs(ids: Snowflake[]): Promise<User[]> {
		return await Promise.all(ids.map((id) => client.users.fetch(id)));
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
	public async shell(command: string): Promise<{
		stdout: string;
		stderr: string;
	}> {
		return await promisify(exec)(command);
	}

	/**
	 * Posts text to hastebin
	 * @param content The text to post
	 * @returns The url of the posted text
	 */
	public async haste(
		content: string,
		substr = false
	): Promise<{ url?: string; error?: 'content too long' | 'substr' | 'unable to post' }> {
		let isSubstr = false;
		if (content.length > 400_000 && !substr) {
			void this.handleError('haste', new Error(`content over 400,000 characters (${content.length.toLocaleString()})`));
			return { error: 'content too long' };
		} else if (content.length > 400_000) {
			content = content.substr(0, 400_000);
			isSubstr = true;
		}
		for (const url of this.#hasteURLs) {
			try {
				const res: hastebinRes = await got.post(`${url}/documents`, { body: content }).json();
				return { url: `${url}/${res.key}`, error: isSubstr ? 'substr' : undefined };
			} catch {
				void client.console.error('haste', `Unable to upload haste to ${url}`);
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
				return await client.users.fetch(text as Snowflake);
			} catch {
				// pass
			}
		}
		const mentionReg = /<@!?(?<id>\d{17,19})>/;
		const mentionMatch = text.match(mentionReg);
		if (mentionMatch) {
			try {
				return await client.users.fetch(mentionMatch.groups!.id as Snowflake);
			} catch {
				// pass
			}
		}
		const user = client.users.cache.find((u) => u.username === text);
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
			const ch: number = Math.floor(i / perChunk);
			(all as any[])[ch] = [].concat(all[ch] || [], one as any);
			return all;
		}, []);
	}

	/**
	 * Commonly Used Colors
	 */
	get colors() {
		return client.consts.colors;
	}

	/**
	 * Commonly Used Emojis
	 */
	get emojis() {
		return client.consts.emojis;
	}

	/**
	 * A simple utility to create and embed with the needed style for the bot
	 */
	public createEmbed(color?: ColorResolvable, author?: User | GuildMember): MessageEmbed {
		if (author instanceof GuildMember) {
			author = author.user; // Convert to User if GuildMember
		}
		let embed = new MessageEmbed().setTimestamp();
		if (author)
			embed = embed.setAuthor(
				author.username,
				author.displayAvatarURL({ dynamic: true }),
				`https://discord.com/users/${author.id}`
			);
		if (color) embed = embed.setColor(color);
		return embed;
	}

	public async mcUUID(username: string): Promise<string> {
		const apiRes = (await got.get(`https://api.ashcon.app/mojang/v2/user/${username}`).json()) as uuidRes;
		return apiRes.uuid.replace(/-/g, '');
	}

	/**
	 * Surrounds text in a code block with the specified language and puts it in a hastebin if its too long.
	 * * Embed Description Limit = 4096 characters
	 * * Embed Field Limit = 1024 characters
	 */
	public async codeblock(code: string, length: number, language: CodeBlockLang | '' = '', substr = false): Promise<string> {
		let hasteOut = '';
		code = this.discord.escapeCodeBlock(code);
		const prefix = `\`\`\`${language}\n`;
		const suffix = '\n```';
		if (code.length + (prefix + suffix).length >= length) {
			const haste = await this.haste(code, substr);
			hasteOut = `Too large to display. ${
				haste.url
					? `Hastebin: ${haste.url}${haste.error ? ` - ${haste.error}` : ''}`
					: `${this.emojis.error} Hastebin: ${haste.error}`
			}`;
		}

		const FormattedHaste = hasteOut.length ? `\n${hasteOut}` : '';
		const shortenedCode = hasteOut ? code.substring(0, length - (prefix + FormattedHaste + suffix).length) : code;
		const code3 = code.length ? prefix + shortenedCode + suffix + FormattedHaste : prefix + suffix;
		if (code3.length > length) {
			void client.console.warn(`codeblockError`, `Required Length: ${length}. Actual Length: ${code3.length}`, true);
			void client.console.warn(`codeblockError`, code3, true);
			throw new Error('code too long');
		}
		return code3;
	}

	/**
	 * Uses {@link inspect} with custom defaults
	 * @param object - The object you would like to inspect
	 * @param options - The options you would like to use to inspect the object
	 */
	public inspect(object: any, options?: BushInspectOptions): string {
		const {
			showHidden: _showHidden = false,
			depth: _depth = 2,
			colors: _colors = false,
			customInspect: _customInspect = true,
			showProxy: _showProxy = false,
			maxArrayLength: _maxArrayLength = Infinity,
			maxStringLength: _maxStringLength = Infinity,
			breakLength: _breakLength = 80,
			compact: _compact = 3,
			sorted: _sorted = false,
			getters: _getters = true
		} = options ?? {};
		const optionsWithDefaults: BushInspectOptions = {
			showHidden: _showHidden,
			depth: _depth,
			colors: _colors,
			customInspect: _customInspect,
			showProxy: _showProxy,
			maxArrayLength: _maxArrayLength,
			maxStringLength: _maxStringLength,
			breakLength: _breakLength,
			compact: _compact,
			sorted: _sorted,
			getters: _getters
		};
		return inspect(object, optionsWithDefaults);
	}

	#mapCredential(old: string): string {
		const mapping = {
			token: 'Main Token',
			devToken: 'Dev Token',
			betaToken: 'Beta Token',
			hypixelApiKey: 'Hypixel Api Key',
			wolframAlphaAppId: 'Wolfram|Alpha App ID',
			dbPassword: 'Database Password'
		};
		return mapping[old as keyof typeof mapping] || old;
	}

	/**
	 * Redacts credentials from a string
	 * @param text - The text to redact credentials from
	 */
	public redact(text: string) {
		for (const credentialName in { ...client.config.credentials, dbPassword: client.config.db.password }) {
			const credential = { ...client.config.credentials, dbPassword: client.config.db.password }[
				credentialName as keyof typeof client.config.credentials
			];
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
	 * Takes an any value, inspects it, redacts credentials and puts it in a codeblock
	 * (and uploads to hast if the content is too long)
	 */
	public async inspectCleanRedactCodeblock(
		input: any,
		language?: CodeBlockLang | '',
		inspectOptions?: BushInspectOptions,
		length = 1024
	) {
		input = typeof input !== 'string' ? this.inspect(input, inspectOptions ?? undefined) : input;
		input = this.discord.cleanCodeBlockContent(input);
		input = this.redact(input);
		return this.codeblock(input, length, language, true);
	}

	public async inspectCleanRedactHaste(input: any, inspectOptions?: BushInspectOptions) {
		input = typeof input !== 'string' ? this.inspect(input, inspectOptions ?? undefined) : input;
		input = this.redact(input);
		return this.haste(input, true);
	}

	public inspectAndRedact(input: any, inspectOptions?: BushInspectOptions) {
		input = typeof input !== 'string' ? this.inspect(input, inspectOptions ?? undefined) : input;
		return this.redact(input);
	}

	public async slashRespond(
		interaction: CommandInteraction,
		responseOptions: BushSlashSendMessageType | BushSlashEditMessageType
	): Promise<Message | APIMessage | undefined> {
		const newResponseOptions = typeof responseOptions === 'string' ? { content: responseOptions } : responseOptions;
		if (interaction.replied || interaction.deferred) {
			delete (newResponseOptions as InteractionReplyOptions).ephemeral; // Cannot change a preexisting message to be ephemeral
			return (await interaction.editReply(newResponseOptions)) as Message | APIMessage;
		} else {
			await interaction.reply(newResponseOptions);
			return await interaction.fetchReply().catch(() => undefined);
		}
	}

	/**
	 * Gets a a configured channel as a TextChannel
	 */
	public async getConfigChannel(channel: keyof typeof client['config']['channels']): Promise<TextChannel> {
		return (await client.channels.fetch(client.config.channels[channel])) as unknown as TextChannel;
	}

	/**
	 * Takes an array and combines the elements using the supplied conjunction.
	 * @param array The array to combine.
	 * @param conjunction The conjunction to use.
	 * @param ifEmpty What to return if the array is empty.
	 * @returns The combined elements or `ifEmpty`
	 *
	 * @example
	 * const permissions = oxford(['ADMINISTRATOR', 'SEND_MESSAGES', 'MANAGE_MESSAGES'], 'and', 'none');
	 * console.log(permissions); // ADMINISTRATOR, SEND_MESSAGES and MANAGE_MESSAGES
	 */
	public oxford(array: string[], conjunction: string, ifEmpty?: string): string | undefined {
		const l = array.length;
		if (!l) return ifEmpty;
		if (l < 2) return array[0];
		if (l < 3) return array.join(` ${conjunction} `);
		array = array.slice();
		array[l - 1] = `${conjunction} ${array[l - 1]}`;
		return array.join(', ');
	}

	public async insertOrRemoveFromGlobal(
		action: 'add' | 'remove',
		key: keyof typeof BushCache['global'],
		value: any
	): Promise<Global | void> {
		const row =
			(await Global.findByPk(client.config.environment)) ?? (await Global.create({ environment: client.config.environment }));
		const oldValue: any[] = row[key];
		const newValue = this.addOrRemoveFromArray(action, oldValue, value);
		row[key] = newValue;
		client.cache.global[key] = newValue;
		return await row.save().catch((e) => this.handleError('insertOrRemoveFromGlobal', e));
	}

	/**
	 * Add or remove an item from an array. All duplicates will be removed.
	 */
	public addOrRemoveFromArray<T extends any>(action: 'add' | 'remove', array: T[], value: T): T[] {
		const set = new Set(array);
		action === 'add' ? set.add(value) : set.delete(value);
		return [...set];
	}

	/**
	 * Surrounds a string to the begging an end of each element in an array.
	 * @param array - The array you want to surround.
	 * @param surroundChar1 - The character placed in the beginning of the element.
	 * @param surroundChar2 - The character placed in the end of the element. Defaults to `surroundChar1`.
	 */
	public surroundArray(array: string[], surroundChar1: string, surroundChar2?: string): string[] {
		return array.map((a) => `${surroundChar1}${a}${surroundChar2 ?? surroundChar1}`);
	}

	public parseDuration(content: string, remove = true): { duration: number | null; contentWithoutTime: string | null } {
		if (!content) return { duration: 0, contentWithoutTime: null };

		// eslint-disable-next-line prefer-const
		let duration = null;
		// Try to reduce false positives by requiring a space before the duration, this makes sure it still matches if it is
		// in the beginning of the argument
		let contentWithoutTime = ` ${content}`;

		for (const unit in BushConstants.TimeUnits) {
			const regex = BushConstants.TimeUnits[unit].match;
			const match = regex.exec(contentWithoutTime);
			const value = Number(match?.groups?.[unit]);
			if (!isNaN(value)) (duration as unknown as number) += value * BushConstants.TimeUnits[unit].value;

			if (remove) contentWithoutTime = contentWithoutTime.replace(regex, '');
		}
		// remove the space added earlier
		if (contentWithoutTime.startsWith(' ')) contentWithoutTime.replace(' ', '');
		return { duration, contentWithoutTime };
	}

	public humanizeDuration(duration: number, largest?: number): string {
		if (largest) return humanizeDuration(duration, { language: 'en', maxDecimalPoints: 2, largest });
		else return humanizeDuration(duration, { language: 'en', maxDecimalPoints: 2 });
	}

	public timestampDuration(duration: number): string {
		return `<t:${Math.round(duration / 1000)}:R>`;
	}

	/**
	 * **Styles:**
	 * - **t**: Short Time
	 * - **T**: Long Time
	 * - **d**: Short Date
	 * - **D**: Long Date
	 * - **f**: Short Date/Time
	 * - **F**: Long Date/Time
	 * - **R**: Relative Time
	 */
	public timestamp<D extends Date | undefined | null>(
		date: D,
		style: 't' | 'T' | 'd' | 'D' | 'f' | 'F' | 'R' = 'f'
	): D extends Date ? string : undefined {
		if (!date) return date as unknown as D extends Date ? string : undefined;
		return `<t:${Math.round(date.getTime() / 1000)}:${style}>` as unknown as D extends Date ? string : undefined;
	}

	public dateDelta(date: Date, largest?: number) {
		return this.humanizeDuration(moment(date).diff(moment()), largest ?? 3);
	}

	public async findUUID(player: string): Promise<string> {
		try {
			const raw = await got.get(`https://api.ashcon.app/mojang/v2/user/${player}`);
			let profile: MojangProfile;
			if (raw.statusCode == 200) {
				profile = JSON.parse(raw.body);
			} else {
				throw new Error('invalid player');
			}

			if (raw.statusCode == 200 && profile && profile.uuid) {
				return profile.uuid.replace(/-/g, '');
			} else {
				throw new Error(`Could not fetch the uuid for ${player}.`);
			}
		} catch (e) {
			throw new Error('An error has occurred.');
		}
	}

	public hexToRgb(hex: string): string {
		const arrBuff = new ArrayBuffer(4);
		const vw = new DataView(arrBuff);
		vw.setUint32(0, parseInt(hex, 16), false);
		const arrByte = new Uint8Array(arrBuff);

		return `${arrByte[1]}, ${arrByte[2]}, ${arrByte[3]}`;
	}

	/* eslint-disable @typescript-eslint/no-unused-vars */
	public async lockdownChannel(options: { channel: BushTextChannel | BushNewsChannel; moderator: BushUserResolvable }) {}
	/* eslint-enable @typescript-eslint/no-unused-vars */

	public capitalizeFirstLetter(string: string): string {
		return string.charAt(0)?.toUpperCase() + string.slice(1);
	}

	/**
	 * Wait an amount in seconds.
	 */
	public async sleep(s: number): Promise<unknown> {
		return new Promise((resolve) => setTimeout(resolve, s * 1000));
	}

	public async handleError(context: string, error: Error) {
		await client.console.error(_.camelCase(context), `An error occurred:\n${error?.stack ?? (error as any)}`, false);
		await client.console.channelError({
			embeds: [await CommandErrorListener.generateErrorEmbed({ type: 'unhandledRejection', error: error, context })]
		});
	}

	public async resolveNonCachedUser(user: UserResolvable | undefined | null): Promise<BushUser | undefined> {
		if (!user) return undefined;
		const id =
			user instanceof User || user instanceof GuildMember || user instanceof ThreadMember
				? user.id
				: user instanceof Message
				? user.author.id
				: typeof user === 'string'
				? user
				: undefined;
		if (!id) return undefined;
		else return await client.users.fetch(id).catch(() => undefined);
	}

	public async getPronounsOf(user: User | Snowflake): Promise<Pronoun | undefined> {
		const _user = await this.resolveNonCachedUser(user);
		if (!_user) throw new Error(`Cannot find user ${user}`);
		const apiRes = (await got
			.get(`https://pronoundb.org/api/v1/lookup?platform=discord&id=${_user.id}`)
			.json()
			.catch(() => undefined)) as { pronouns: PronounCode } | undefined;

		if (!apiRes) return undefined;
		if (!apiRes.pronouns) throw new Error('apiRes.pronouns is undefined');

		return client.constants.pronounMapping[apiRes.pronouns];
	}

	// modified from https://stackoverflow.com/questions/31054910/get-functions-methods-of-a-class
	// answer by Bruno Grieder
	public getMethods(_obj: any): string {
		let props: string[] = [];
		let obj: any = new Object(_obj);

		do {
			const l = Object.getOwnPropertyNames(obj)
				.concat(Object.getOwnPropertySymbols(obj).map((s) => s.toString()))
				.sort()
				.filter(
					(p, i, arr) =>
						typeof Object.getOwnPropertyDescriptor(obj, p)?.['get'] !== 'function' && // ignore getters
						typeof Object.getOwnPropertyDescriptor(obj, p)?.['set'] !== 'function' && // ignore  setters
						typeof obj[p] === 'function' && //only the methods
						p !== 'constructor' && //not the constructor
						(i == 0 || p !== arr[i - 1]) && //not overriding in this prototype
						props.indexOf(p) === -1 //not overridden in a child
				);

			const reg = /\(([\s\S]*?)\)/;
			props = props.concat(
				l.map(
					(p) =>
						`${obj[p] && obj[p][Symbol.toStringTag] === 'AsyncFunction' ? 'async ' : ''}function ${p}(${
							reg.exec(obj[p].toString())?.[1]
								? reg
										.exec(obj[p].toString())?.[1]
										.split(', ')
										.map((arg) => arg.split('=')[0].trim())
										.join(', ')
								: ''
						});`
				)
			);
		} while (
			(obj = Object.getPrototypeOf(obj)) && //walk-up the prototype chain
			Object.getPrototypeOf(obj) //not the the Object prototype methods (hasOwnProperty, etc...)
		);

		return props.join('\n');
	}

	/**
	 * Removes all characters in a string that are either control characters or change the direction of text etc.
	 */
	public sanitizeWtlAndControl(str: string) {
		// eslint-disable-next-line no-control-regex
		return str.replace(/[\u0000-\u001F\u007F-\u009F\u200B]/g, '');
	}

	public async uploadImageToImgur(image: string) {
		const clientId = this.client.config.credentials.imgurClientId;

		const resp = (await got
			.post('https://api.imgur.com/3/upload', {
				headers: {
					// Authorization: `Bearer ${token}`,
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

	public userGuildPermCheck(message: BushMessage | BushSlashMessage, permissions: PermissionResolvable) {
		const missing = message.member?.permissions.missing(permissions) ?? [];

		return missing.length ? missing : null;
	}

	public clientGuildPermCheck(message: BushMessage | BushSlashMessage, permissions: PermissionResolvable) {
		const missing = message.guild?.me?.permissions.missing(permissions) ?? [];

		return missing.length ? missing : null;
	}

	public clientSendAndPermCheck(
		message: BushMessage | BushSlashMessage,
		permissions: PermissionResolvable = [],
		checkChannel = false
	) {
		const missing = [];
		const sendPerm = message.channel!.isThread() ? 'SEND_MESSAGES' : 'SEND_MESSAGES_IN_THREADS';

		if (!message.guild!.me!.permissionsIn(message.channel!.id!).has(sendPerm)) missing.push(sendPerm);

		missing.push(
			...(checkChannel
				? message.guild!.me!.permissionsIn(message.channel!.id!).missing(permissions)
				: this.clientGuildPermCheck(message, permissions) ?? [])
		);

		return missing.length ? missing : null;
	}

	public prefix(message: BushMessage | BushSlashMessage): string {
		return message.util.isSlash
			? '/'
			: client.config.isDevelopment
			? 'dev '
			: message.util.parsed?.prefix ?? client.config.prefix;
	}

	public get arg() {
		return Arg;
	}

	/**
	 * Formats and escapes content for formatting
	 */
	public get format() {
		return Format;
	}

	/**
	 * Discord.js's Util class
	 */
	public get discord() {
		return DiscordUtil;
	}

	/**
	 * discord-akairo's Util class
	 */
	public get akairo() {
		return AkairoUtil;
	}
}

interface hastebinRes {
	key: string;
}

export interface uuidRes {
	uuid: string;
	username: string;
	username_history?: { username: string }[] | null;
	textures: {
		custom: boolean;
		slim: boolean;
		skin: {
			url: string;
			data: string;
		};
		raw: {
			value: string;
			signature: string;
		};
	};
	created_at: string;
}

interface MojangProfile {
	username: string;
	uuid: string;
}
