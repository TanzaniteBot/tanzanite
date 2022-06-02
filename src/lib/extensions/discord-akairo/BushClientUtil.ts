import {
	Arg,
	BaseBushArgumentType,
	BushConstants,
	Global,
	Shared,
	SharedCache,
	type BushClient,
	type BushInspectOptions,
	type BushMessage,
	type BushSlashEditMessageType,
	type BushSlashMessage,
	type BushSlashSendMessageType,
	type BushUser,
	type CodeBlockLang,
	type GlobalCache,
	type Pronoun,
	type PronounCode
} from '#lib';
import { humanizeDuration } from '@notenoughupdates/humanize-duration';
import assert from 'assert';
import { exec } from 'child_process';
import deepLock from 'deep-lock';
import { ClientUtil, Util as AkairoUtil } from 'discord-akairo';
import { APIEmbed, APIMessage, OAuth2Scopes, Routes } from 'discord-api-types/v10';
import {
	Constants as DiscordConstants,
	EmbedBuilder,
	GuildMember,
	Message,
	PermissionFlagsBits,
	PermissionsBitField,
	PermissionsString,
	ThreadMember,
	User,
	Util as DiscordUtil,
	type CommandInteraction,
	type InteractionReplyOptions,
	type Snowflake,
	type TextChannel,
	type UserResolvable
} from 'discord.js';
import got from 'got';
import _ from 'lodash';
import { inspect, promisify } from 'util';
import CommandErrorListener from '../../../listeners/commands/commandError.js';
import { Format } from '../../common/util/Format.js';

export type StripPrivate<T> = { [K in keyof T]: T[K] extends Record<string, any> ? StripPrivate<T[K]> : T[K] };

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
	public get colors() {
		return client.consts.colors;
	}

	/**
	 * Commonly Used Emojis
	 */
	public get emojis() {
		return client.consts.emojis;
	}

	/**
	 * Just the ids of Commonly Used Emojis
	 */
	public get emojisRaw() {
		return client.consts.emojisRaw;
	}

	/**
	 * Fetches a user's uuid from the mojang api.
	 * @param username The username to get the uuid of.
	 * @returns The the uuid of the user.
	 */
	public async mcUUID(username: string, dashed = false): Promise<string> {
		const apiRes = (await got.get(`https://api.ashcon.app/mojang/v2/user/${username}`).json()) as UuidRes;
		return dashed ? apiRes.uuid : apiRes.uuid.replace(/-/g, '');
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
		code = this.discord.escapeCodeBlock(code);
		const prefix = `\`\`\`${language}\n`;
		const suffix = '\n```';
		if (code.length + (prefix + suffix).length >= length) {
			const haste = await this.haste(code, substr);
			hasteOut = `Too large to display. ${
				haste.url
					? `Hastebin: ${haste.url}${language ? `.${language}` : ''}${haste.error ? ` - ${haste.error}` : ''}`
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
	 * Generate defaults for {@link inspect}.
	 * @param options The options to create defaults with.
	 * @returns The default options combined with the specified options.
	 */
	#getDefaultInspectOptions(options?: BushInspectOptions): BushInspectOptions {
		return {
			showHidden: options?.showHidden ?? false,
			depth: options?.depth ?? 2,
			colors: options?.colors ?? false,
			customInspect: options?.customInspect ?? true,
			showProxy: options?.showProxy ?? false,
			maxArrayLength: options?.maxArrayLength ?? Infinity,
			maxStringLength: options?.maxStringLength ?? Infinity,
			breakLength: options?.breakLength ?? 80,
			compact: options?.compact ?? 3,
			sorted: options?.sorted ?? false,
			getters: options?.getters ?? true
		};
	}

	/**
	 * Maps the key of a credential with a readable version when redacting.
	 * @param key The key of the credential.
	 * @returns The readable version of the key or the original key if there isn't a mapping.
	 */
	#mapCredential(key: string): string {
		const mapping = {
			token: 'Main Token',
			devToken: 'Dev Token',
			betaToken: 'Beta Token',
			hypixelApiKey: 'Hypixel Api Key',
			wolframAlphaAppId: 'Wolfram|Alpha App ID',
			dbPassword: 'Database Password'
		};
		return mapping[key as keyof typeof mapping] || key;
	}

	/**
	 * Redacts credentials from a string.
	 * @param text The text to redact credentials from.
	 * @returns The redacted text.
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
	 * Uses {@link inspect} with custom defaults.
	 * @param object - The object you would like to inspect.
	 * @param options - The options you would like to use to inspect the object.
	 * @returns The inspected object.
	 */
	public inspect(object: any, options?: BushInspectOptions): string {
		const optionsWithDefaults = this.#getDefaultInspectOptions(options);

		if (!optionsWithDefaults.inspectStrings && typeof object === 'string') return object;

		return inspect(object, optionsWithDefaults);
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
		input = this.inspect(input, inspectOptions ?? undefined);
		if (inspectOptions) inspectOptions.inspectStrings = undefined;
		input = this.discord.cleanCodeBlockContent(input);
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
		input = this.inspect(input, inspectOptions ?? undefined);
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
		input = this.inspect(input, inspectOptions ?? undefined);
		return this.redact(input);
	}

	/**
	 * Responds to a slash command interaction.
	 * @param interaction The interaction to respond to.
	 * @param responseOptions The options for the response.
	 * @returns The message sent.
	 */
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
	 * Gets a a configured channel as a TextChannel.
	 * @channel The channel to retrieve.
	 */
	public async getConfigChannel(channel: keyof typeof client['config']['channels']): Promise<TextChannel> {
		return (await client.channels.fetch(client.config.channels[channel])) as unknown as TextChannel;
	}

	/**
	 * Takes an array and combines the elements using the supplied conjunction.
	 * @param array The array to combine.
	 * @param conjunction The conjunction to use.
	 * @param ifEmpty What to return if the array is empty.
	 * @returns The combined elements or `ifEmpty`.
	 *
	 * @example
	 * const permissions = oxford(['Administrator', 'SendMessages', 'ManageMessages'], 'and', 'none');
	 * console.log(permissions); // Administrator, SendMessages and ManageMessages
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
		return key ? client.cache.global[key] : client.cache.global;
	}

	public getShared(): SharedCache;
	public getShared<K extends keyof SharedCache>(key: K): SharedCache[K];
	public getShared(key?: keyof SharedCache) {
		return key ? client.cache.shared[key] : client.cache.shared;
	}

	/**
	 * Add or remove an element from an array stored in the Globals database.
	 * @param action Either `add` or `remove` an element.
	 * @param key The key of the element in the global cache to update.
	 * @param value The value to add/remove from the array.
	 */
	public async insertOrRemoveFromGlobal<K extends keyof typeof client['cache']['global']>(
		action: 'add' | 'remove',
		key: K,
		value: typeof client['cache']['global'][K][0]
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
	 * Add or remove an element from an array stored in the Shared database.
	 * @param action Either `add` or `remove` an element.
	 * @param key The key of the element in the shared cache to update.
	 * @param value The value to add/remove from the array.
	 */
	public async insertOrRemoveFromShared<K extends Exclude<keyof typeof client['cache']['shared'], 'badWords' | 'autoBanCode'>>(
		action: 'add' | 'remove',
		key: K,
		value: typeof client['cache']['shared'][K][0]
	): Promise<Shared | void> {
		const row = (await Shared.findByPk(0)) ?? (await Shared.create());
		const oldValue: any[] = row[key];
		const newValue = this.addOrRemoveFromArray(action, oldValue, value);
		row[key] = newValue;
		client.cache.shared[key] = newValue;
		return await row.save().catch((e) => this.handleError('insertOrRemoveFromShared', e));
	}

	/**
	 * Updates an element in the Globals database.
	 * @param key The key in the global cache to update.
	 * @param value The value to set the key to.
	 */
	public async setGlobal<K extends keyof typeof client['cache']['global']>(
		key: K,
		value: typeof client['cache']['global'][K]
	): Promise<Global | void> {
		const row =
			(await Global.findByPk(client.config.environment)) ?? (await Global.create({ environment: client.config.environment }));
		row[key] = value;
		client.cache.global[key] = value;
		return await row.save().catch((e) => this.handleError('setGlobal', e));
	}

	/**
	 * Updates an element in the Shared database.
	 * @param key The key in the shared cache to update.
	 * @param value The value to set the key to.
	 */
	public async setShared<K extends Exclude<keyof typeof client['cache']['shared'], 'badWords' | 'autoBanCode'>>(
		key: K,
		value: typeof client['cache']['shared'][K]
	): Promise<Shared | void> {
		const row = (await Shared.findByPk(0)) ?? (await Shared.create());
		row[key] = value;
		client.cache.shared[key] = value;
		return await row.save().catch((e) => this.handleError('setShared', e));
	}

	/**
	 * Add or remove an item from an array. All duplicates will be removed.
	 * @param action Either `add` or `remove` an element.
	 * @param array The array to add/remove an element from.
	 * @param value The element to add/remove from the array.
	 */
	public addOrRemoveFromArray<T>(action: 'add' | 'remove', array: T[], value: T): T[] {
		const set = new Set(array);
		action === 'add' ? set.add(value) : set.delete(value);
		return [...set];
	}

	/**
	 * Remove an item from an array. All duplicates will be removed.
	 * @param array The array to remove an element from.
	 * @param value The element to remove from the array.
	 */
	public removeFromArray<T>(array: T[], value: T): T[] {
		return this.addOrRemoveFromArray('remove', array, value);
	}

	/**
	 * Add an item from an array. All duplicates will be removed.
	 * @param array The array to add an element to.
	 * @param value The element to add to the array.
	 */
	public addToArray<T>(array: T[], value: T): T[] {
		return this.addOrRemoveFromArray('add', array, value);
	}

	/**
	 * Surrounds a string to the begging an end of each element in an array.
	 * @param array The array you want to surround.
	 * @param surroundChar1 The character placed in the beginning of the element.
	 * @param surroundChar2 The character placed in the end of the element. Defaults to `surroundChar1`.
	 */
	public surroundArray(array: string[], surroundChar1: string, surroundChar2?: string): string[] {
		return array.map((a) => `${surroundChar1}${a}${surroundChar2 ?? surroundChar1}`);
	}

	/**
	 * Gets the duration from a specified string.
	 * @param content The string to look for a duration in.
	 * @param remove Whether or not to remove the duration from the original string.
	 * @returns The {@link ParsedDuration}.
	 */
	public parseDuration(content: string, remove = true): ParsedDuration {
		if (!content) return { duration: 0, content: null };

		// eslint-disable-next-line prefer-const
		let duration: number | null = null;
		// Try to reduce false positives by requiring a space before the duration, this makes sure it still matches if it is
		// in the beginning of the argument
		let contentWithoutTime = ` ${content}`;

		for (const unit in BushConstants.timeUnits) {
			const regex = BushConstants.timeUnits[unit as keyof typeof BushConstants.timeUnits].match;
			const match = regex.exec(contentWithoutTime);
			const value = Number(match?.groups?.[unit]);
			if (!isNaN(value)) duration! += value * BushConstants.timeUnits[unit as keyof typeof BushConstants.timeUnits].value;

			if (remove) contentWithoutTime = contentWithoutTime.replace(regex, '');
		}
		// remove the space added earlier
		if (contentWithoutTime.startsWith(' ')) contentWithoutTime.replace(' ', '');
		return { duration, content: contentWithoutTime };
	}

	/**
	 * Converts a duration in milliseconds to a human readable form.
	 * @param duration The duration in milliseconds to convert.
	 * @param largest The maximum number of units to display for the duration.
	 * @param round Whether or not to round the smallest unit displayed.
	 * @returns A humanized string of the duration.
	 */
	public humanizeDuration(duration: number, largest?: number, round = true): string {
		if (largest) return humanizeDuration(duration, { language: 'en', maxDecimalPoints: 2, largest, round })!;
		else return humanizeDuration(duration, { language: 'en', maxDecimalPoints: 2, round })!;
	}

	/**
	 * Creates a formatted relative timestamp from a duration in milliseconds.
	 * @param duration The duration in milliseconds.
	 * @returns The formatted relative timestamp.
	 */
	public timestampDuration(duration: number): string {
		return `<t:${Math.round(new Date().getTime() / 1_000 + duration / 1_000)}:R>`;
	}

	/**
	 * Creates a timestamp from a date.
	 * @param date The date to create a timestamp from.
	 * @param style The style of the timestamp.
	 * @returns The formatted timestamp.
	 *
	 * @see
	 * **Styles:**
	 * - **t**: Short Time ex. `16:20`
	 * - **T**: Long Time ex. `16:20:30	`
	 * - **d**: Short Date ex. `20/04/2021`
	 * - **D**: Long Date ex. `20 April 2021`
	 * - **f**: Short Date/Time ex. `20 April 2021 16:20`
	 * - **F**: Long Date/Time ex. `Tuesday, 20 April 2021 16:20`
	 * - **R**: Relative Time ex. `2 months ago`
	 */
	public timestamp<D extends Date | undefined | null>(date: D, style: TimestampStyle = 'f'): D extends Date ? string : undefined {
		if (!date) return date as unknown as D extends Date ? string : undefined;
		return `<t:${Math.round(date.getTime() / 1_000)}:${style}>` as unknown as D extends Date ? string : undefined;
	}

	/**
	 * Creates a human readable representation between a date and the current time.
	 * @param date The date to be compared with the current time.
	 * @param largest The maximum number of units to display for the duration.
	 * @param round Whether or not to round the smallest unit displayed.
	 * @returns A humanized string of the delta.
	 */
	public dateDelta(date: Date, largest?: number, round = true): string {
		return this.humanizeDuration(new Date().getTime() - date.getTime(), largest ?? 3, round);
	}

	/**
	 * Combines {@link timestamp} and {@link dateDelta}
	 * @param date The date to be compared with the current time.
	 * @param style The style of the timestamp.
	 * @returns The formatted timestamp.
	 *
	 * @see
	 * **Styles:**
	 * - **t**: Short Time ex. `16:20`
	 * - **T**: Long Time ex. `16:20:30	`
	 * - **d**: Short Date ex. `20/04/2021`
	 * - **D**: Long Date ex. `20 April 2021`
	 * - **f**: Short Date/Time ex. `20 April 2021 16:20`
	 * - **F**: Long Date/Time ex. `Tuesday, 20 April 2021 16:20`
	 * - **R**: Relative Time ex. `2 months ago`
	 */
	public timestampAndDelta(date: Date, style: TimestampStyle = 'D'): string {
		return `${this.timestamp(date, style)} (${this.dateDelta(date)} ago)`;
	}

	/**
	 * Convert a hex code to an rbg value.
	 * @param hex The hex code to convert.
	 * @returns The rbg value.
	 */
	public hexToRgb(hex: string): string {
		const arrBuff = new ArrayBuffer(4);
		const vw = new DataView(arrBuff);
		vw.setUint32(0, parseInt(hex, 16), false);
		const arrByte = new Uint8Array(arrBuff);

		return `${arrByte[1]}, ${arrByte[2]}, ${arrByte[3]}`;
	}

	/**
	 * Capitalize the first letter of a string.
	 * @param string The string to capitalize the first letter of.
	 * @returns The string with the first letter capitalized.
	 */
	public capitalizeFirstLetter(string: string): string {
		return string.charAt(0)?.toUpperCase() + string.slice(1);
	}

	/**
	 * Wait an amount in milliseconds.
	 * @returns A promise that resolves after the specified amount of milliseconds
	 */
	public get sleep() {
		return promisify(setTimeout);
	}

	/**
	 * Send a message in the error logging channel and console for an error.
	 * @param context
	 * @param error
	 */
	public async handleError(context: string, error: Error) {
		await client.console.error(_.camelCase(context), `An error occurred:\n${util.formatError(error, true)}`, false);
		await client.console.channelError({
			embeds: await CommandErrorListener.generateErrorEmbed({ type: 'unhandledRejection', error: error, context })
		});
	}

	/**
	 * Fetches a user from discord.
	 * @param user The user to fetch
	 * @returns Undefined if the user is not found, otherwise the user.
	 */
	public async resolveNonCachedUser(user: UserResolvable | undefined | null): Promise<BushUser | undefined> {
		if (user == null) return undefined;
		const resolvedUser =
			user instanceof User
				? <BushUser>user
				: user instanceof GuildMember
				? <BushUser>user.user
				: user instanceof ThreadMember
				? <BushUser>user.user
				: user instanceof Message
				? <BushUser>user.author
				: undefined;

		return resolvedUser ?? (await client.users.fetch(user as Snowflake).catch(() => undefined));
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

		return client.constants.pronounMapping[apiRes.pronouns!]!;
	}

	/**
	 * List the methods of an object.
	 * @param obj The object to get the methods of.
	 * @returns A string with each method on a new line.
	 */
	public getMethods(obj: Record<string, any>): string {
		// modified from https://stackoverflow.com/questions/31054910/get-functions-methods-of-a-class/31055217#31055217
		let props: string[] = [];
		let obj_: Record<string, any> = new Object(obj);

		do {
			const l = Object.getOwnPropertyNames(obj_)
				.concat(Object.getOwnPropertySymbols(obj_).map((s) => s.toString()))
				.sort()
				.filter(
					(p, i, arr) =>
						typeof Object.getOwnPropertyDescriptor(obj_, p)?.['get'] !== 'function' && // ignore getters
						typeof Object.getOwnPropertyDescriptor(obj_, p)?.['set'] !== 'function' && // ignore setters
						typeof obj_[p] === 'function' && // only the methods
						p !== 'constructor' && // not the constructor
						(i == 0 || p !== arr[i - 1]) && // not overriding in this prototype
						props.indexOf(p) === -1 // not overridden in a child
				);

			const reg = /\(([\s\S]*?)\)/;
			props = props.concat(
				l.map(
					(p) =>
						`${obj_[p] && obj_[p][Symbol.toStringTag] === 'AsyncFunction' ? 'async ' : ''}function ${p}(${
							reg.exec(obj_[p].toString())?.[1]
								? reg
										.exec(obj_[p].toString())?.[1]
										.split(', ')
										.map((arg) => arg.split('=')[0].trim())
										.join(', ')
								: ''
						});`
				)
			);
		} while (
			(obj_ = Object.getPrototypeOf(obj_)) && // walk-up the prototype chain
			Object.getPrototypeOf(obj_) // not the the Object prototype methods (hasOwnProperty, etc...)
		);

		return props.join('\n');
	}

	/**
	 * List the symbols of an object.
	 * @param obj The object to get the symbols of.
	 * @returns An array of the symbols of the object.
	 */
	public getSymbols(obj: Record<string, any>): symbol[] {
		let symbols: symbol[] = [];
		let obj_: Record<string, any> = new Object(obj);

		do {
			const l = Object.getOwnPropertySymbols(obj_).sort();

			symbols = [...symbols, ...l];
		} while (
			(obj_ = Object.getPrototypeOf(obj_)) && // walk-up the prototype chain
			Object.getPrototypeOf(obj_) // not the the Object prototype methods (hasOwnProperty, etc...)
		);

		return symbols;
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
	 * Checks if a user has a certain guild permission (doesn't check channel permissions).
	 * @param message The message to check the user from.
	 * @param permissions The permissions to check for.
	 * @returns The missing permissions or null if none are missing.
	 */
	public userGuildPermCheck(
		message: BushMessage | BushSlashMessage,
		permissions: typeof PermissionFlagsBits[keyof typeof PermissionFlagsBits][]
	): PermissionsString[] | null {
		const missing = message.member?.permissions.missing(permissions) ?? [];

		return missing.length ? missing : null;
	}

	/**
	 * Check if the client has certain permissions in the guild (doesn't check channel permissions).
	 * @param message The message to check the client user from.
	 * @param permissions The permissions to check for.
	 * @returns The missing permissions or null if none are missing.
	 */
	public clientGuildPermCheck(message: BushMessage | BushSlashMessage, permissions: bigint[]): PermissionsString[] | null {
		const missing = message.guild?.members.me?.permissions.missing(permissions) ?? [];

		return missing.length ? missing : null;
	}

	/**
	 * Check if the client has permission to send messages in the channel as well as check if they have other permissions
	 * in the guild (or the channel if `checkChannel` is `true`).
	 * @param message The message to check the client user from.
	 * @param permissions The permissions to check for.
	 * @param checkChannel Whether to check the channel permissions instead of the guild permissions.
	 * @returns The missing permissions or null if none are missing.
	 */
	public clientSendAndPermCheck(
		message: BushMessage | BushSlashMessage,
		permissions: bigint[] = [],
		checkChannel = false
	): PermissionsString[] | null {
		const missing: PermissionsString[] = [];
		const sendPerm = message.channel!.isThread() ? 'SendMessages' : 'SendMessagesInThreads';
		if (!message.inGuild()) return null;

		if (!message.guild.members.me!.permissionsIn(message.channel.id).has(sendPerm)) missing.push(sendPerm);

		missing.push(
			...(checkChannel
				? message.guild!.members.me!.permissionsIn(message.channel!.id!).missing(permissions)
				: this.clientGuildPermCheck(message, permissions) ?? [])
		);

		return missing.length ? missing : null;
	}

	/**
	 * Gets the prefix based off of the message.
	 * @param message The message to get the prefix from.
	 * @returns The prefix.
	 */
	public prefix(message: BushMessage | BushSlashMessage): string {
		return message.util.isSlash
			? '/'
			: client.config.isDevelopment
			? 'dev '
			: message.util.parsed?.prefix ?? client.config.prefix;
	}

	/**
	 * Recursively apply provided options operations on object
	 * and all of the object properties that are either object or function.
	 *
	 * By default freezes object.
	 *
	 * @param obj - The object to which will be applied `freeze`, `seal` or `preventExtensions`
	 * @param options default `{ action: 'freeze' }`
	 * @param options.action
	 * ```
	 * | action            | Add | Modify | Delete | Reconfigure |
	 * | ----------------- | --- | ------ | ------ | ----------- |
	 * | preventExtensions |  -  |   +    |   +    |      +      |
	 * | seal              |  -  |   +    |   -    |      -      |
	 * | freeze            |  -  |   -    |   -    |      -      |
	 * ```
	 *
	 * @returns Initial object with applied options action
	 */
	public get deepFreeze() {
		return deepLock;
	}

	/**
	 * Recursively apply provided options operations on object
	 * and all of the object properties that are either object or function.
	 *
	 * By default freezes object.
	 *
	 * @param obj - The object to which will be applied `freeze`, `seal` or `preventExtensions`
	 * @param options default `{ action: 'freeze' }`
	 * @param options.action
	 * ```
	 * | action            | Add | Modify | Delete | Reconfigure |
	 * | ----------------- | --- | ------ | ------ | ----------- |
	 * | preventExtensions |  -  |   +    |   +    |      +      |
	 * | seal              |  -  |   +    |   -    |      -      |
	 * | freeze            |  -  |   -    |   -    |      -      |
	 * ```
	 *
	 * @returns Initial object with applied options action
	 */
	public static get deepFreeze() {
		return deepLock;
	}

	/**
	 * The link to invite the bot with all permissions.
	 */
	public get invite() {
		return client.generateInvite({
			permissions:
				PermissionsBitField.All -
				PermissionFlagsBits.UseEmbeddedActivities -
				PermissionFlagsBits.ViewGuildInsights -
				PermissionFlagsBits.Stream,
			scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands]
		});
	}

	/**
	 * Asset multiple statements at a time.
	 * @param args
	 */
	public assertAll(...args: any[]): void {
		for (let i = 0; i < args.length; i++) {
			assert(args[i], `assertAll index ${i} failed`);
		}
	}

	/**
	 * Casts a string to a duration and reason for slash commands.
	 * @param arg The argument received.
	 * @param message The message that triggered the command.
	 * @returns The casted argument.
	 */
	public async castDurationContent(
		arg: string | ParsedDuration | null,
		message: BushMessage | BushSlashMessage
	): Promise<ParsedDurationRes> {
		const res = typeof arg === 'string' ? await util.arg.cast('contentWithDuration', message, arg) : arg;

		return { duration: res?.duration ?? 0, content: res?.content ?? '' };
	}

	/**
	 * Casts a string to a the specified argument type.
	 * @param type The type of the argument to cast to.
	 * @param arg The argument received.
	 * @param message The message that triggered the command.
	 * @returns The casted argument.
	 */
	public async cast<T extends keyof BaseBushArgumentType>(
		type: T,
		arg: BaseBushArgumentType[T] | string,
		message: BushMessage | BushSlashMessage
	) {
		return typeof arg === 'string' ? await util.arg.cast(type, message, arg) : arg;
	}

	/**
	 * Overflows the description of an embed into multiple embeds.
	 * @param embed The options to be applied to the (first) embed.
	 * @param lines Each line of the description as an element in an array.
	 */
	public overflowEmbed(embed: Omit<APIEmbed, 'description'>, lines: string[], maxLength = 4096): EmbedBuilder[] {
		const embeds: EmbedBuilder[] = [];

		const makeEmbed = () => {
			embeds.push(new EmbedBuilder().setColor(embed.color ?? null));
			return embeds.at(-1)!;
		};

		for (const line of lines) {
			let current = embeds.length ? embeds.at(-1)! : makeEmbed();
			let joined = current.data.description ? `${current.data.description}\n${line}` : line;
			if (joined.length > maxLength) {
				current = makeEmbed();
				joined = line;
			}

			current.setDescription(joined);
		}

		if (!embeds.length) makeEmbed();

		if (embed.author) embeds.at(0)?.setAuthor(embed.author);
		if (embed.title) embeds.at(0)?.setTitle(embed.title);
		if (embed.url) embeds.at(0)?.setURL(embed.url);
		if (embed.fields) embeds.at(-1)?.setFields(embed.fields);
		if (embed.thumbnail) embeds.at(-1)?.setThumbnail(embed.thumbnail.url);
		if (embed.footer) embeds.at(-1)?.setFooter(embed.footer);
		if (embed.image) embeds.at(-1)?.setImage(embed.image.url);
		if (embed.timestamp) embeds.at(-1)?.setTimestamp(new Date(embed.timestamp));

		return embeds;
	}

	public async resolveMessageLinks(content: string | null): Promise<MessageLinkParts[]> {
		const res: MessageLinkParts[] = [];

		if (!content) return res;

		const regex = new RegExp(this.regex.messageLink);
		let match: RegExpExecArray | null;
		while (((match = regex.exec(content)), match !== null)) {
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
			const guild = client.guilds.cache.get(guild_id);
			if (!guild) continue;
			const channel = guild.channels.cache.get(channel_id);
			if (!channel || (!channel.isTextBased() && !channel.isThread())) continue;

			const message = (await client.rest
				.get(Routes.channelMessage(channel_id, message_id))
				.catch(() => null)) as APIMessage | null;
			if (!message) continue;

			res.push(message);
		}

		return res;
	}

	/**
	 * Formats an error into a string.
	 * @param error The error to format.
	 * @param colors Whether to use colors in the output.
	 * @returns The formatted error.
	 */
	public formatError(error: Error | any, colors = false): string {
		if (!error) return error;
		if (typeof error !== 'object') return String.prototype.toString.call(error);
		if (
			this.getSymbols(error)
				.map((s) => s.toString())
				.includes('Symbol(nodejs.util.inspect.custom)')
		)
			return this.inspect(error, { colors });

		return error.stack;
	}

	/**
	 * A wrapper for the Argument class that adds custom typings.
	 */
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
	 * Discord.js's Util constants
	 */
	public get discordConstants() {
		return DiscordConstants;
	}

	/**
	 * discord-akairo's Util class
	 */
	public get akairo() {
		return AkairoUtil;
	}

	public get consts() {
		return client.consts;
	}

	public get regex() {
		return client.consts.regex;
	}
}

interface HastebinRes {
	key: string;
}

export interface UuidRes {
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

export interface HasteResults {
	url?: string;
	error?: 'content too long' | 'substr' | 'unable to post';
}

export interface ParsedDuration {
	duration: number | null;
	content: string | null;
}

export interface ParsedDurationRes {
	duration: number;
	content: string;
}

export type TimestampStyle = 't' | 'T' | 'd' | 'D' | 'f' | 'F' | 'R';

export interface MessageLinkParts {
	guild_id: Snowflake;
	channel_id: Snowflake;
	message_id: Snowflake;
}
