import {
	Arg,
	BushClient,
	CommandMessage,
	SlashEditMessageType,
	SlashSendMessageType,
	timeUnits,
	type BaseBushArgumentType,
	type BushInspectOptions,
	type SlashMessage
} from '#lib';
import { humanizeDuration as humanizeDurationMod } from '@notenoughupdates/humanize-duration';
import assert from 'assert';
import cp from 'child_process';
import deepLock from 'deep-lock';
import { Util as AkairoUtil } from 'discord-akairo';
import {
	Constants as DiscordConstants,
	EmbedBuilder,
	Message,
	OAuth2Scopes,
	PermissionFlagsBits,
	PermissionsBitField,
	type APIEmbed,
	type APIMessage,
	type CommandInteraction,
	type InteractionReplyOptions,
	type PermissionsString
} from 'discord.js';
import got from 'got';
import { inspect as inspectUtil, promisify } from 'util';
import * as Format from '../common/util/Format.js';

export type StripPrivate<T> = { [K in keyof T]: T[K] extends Record<string, any> ? StripPrivate<T[K]> : T[K] };
export type ValueOf<T> = T[keyof T];

/**
 * Capitalizes the first letter of the given text
 * @param text The text to capitalize
 * @returns The capitalized text
 */
export function capitalize(text: string): string {
	return text.charAt(0).toUpperCase() + text.slice(1);
}

export const exec = promisify(cp.exec);

/**
 * Runs a shell command and gives the output
 * @param command The shell command to run
 * @returns The stdout and stderr of the shell command
 */
export async function shell(command: string): Promise<{ stdout: string; stderr: string }> {
	return await exec(command);
}

/**
 * Appends the correct ordinal to the given number
 * @param n The number to append an ordinal to
 * @returns The number with the ordinal
 */
export function ordinal(n: number): string {
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
export function chunk<T>(arr: T[], perChunk: number): T[][] {
	return arr.reduce((all, one, i) => {
		const ch: number = Math.floor(i / perChunk);
		(all as any[])[ch] = [].concat(all[ch] || [], one as any);
		return all;
	}, []);
}

/**
 * Fetches a user's uuid from the mojang api.
 * @param username The username to get the uuid of.
 * @returns The the uuid of the user.
 */
export async function mcUUID(username: string, dashed = false): Promise<string> {
	const apiRes = (await got.get(`https://api.ashcon.app/mojang/v2/user/${username}`).json()) as UuidRes;
	return dashed ? apiRes.uuid : apiRes.uuid.replace(/-/g, '');
}

/**
 * Generate defaults for {@link inspect}.
 * @param options The options to create defaults with.
 * @returns The default options combined with the specified options.
 */
function getDefaultInspectOptions(options?: BushInspectOptions): BushInspectOptions {
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
 * Uses {@link inspect} with custom defaults.
 * @param object - The object you would like to inspect.
 * @param options - The options you would like to use to inspect the object.
 * @returns The inspected object.
 */
export function inspect(object: any, options?: BushInspectOptions): string {
	const optionsWithDefaults = getDefaultInspectOptions(options);

	if (!optionsWithDefaults.inspectStrings && typeof object === 'string') return object;

	return inspectUtil(object, optionsWithDefaults);
}

/**
 * Responds to a slash command interaction.
 * @param interaction The interaction to respond to.
 * @param responseOptions The options for the response.
 * @returns The message sent.
 */
export async function slashRespond(
	interaction: CommandInteraction,
	responseOptions: SlashSendMessageType | SlashEditMessageType
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
export function oxford(array: string[], conjunction: string, ifEmpty?: string): string | undefined {
	const l = array.length;
	if (!l) return ifEmpty;
	if (l < 2) return array[0];
	if (l < 3) return array.join(` ${conjunction} `);
	array = array.slice();
	array[l - 1] = `${conjunction} ${array[l - 1]}`;
	return array.join(', ');
}

/**
 * Add or remove an item from an array. All duplicates will be removed.
 * @param action Either `add` or `remove` an element.
 * @param array The array to add/remove an element from.
 * @param value The element to add/remove from the array.
 */
export function addOrRemoveFromArray<T>(action: 'add' | 'remove', array: T[], value: T): T[] {
	const set = new Set(array);
	action === 'add' ? set.add(value) : set.delete(value);
	return [...set];
}

/**
 * Remove an item from an array. All duplicates will be removed.
 * @param array The array to remove an element from.
 * @param value The element to remove from the array.
 */
export function removeFromArray<T>(array: T[], value: T): T[] {
	return addOrRemoveFromArray('remove', array, value);
}

/**
 * Add an item from an array. All duplicates will be removed.
 * @param array The array to add an element to.
 * @param value The element to add to the array.
 */
export function addToArray<T>(array: T[], value: T): T[] {
	return addOrRemoveFromArray('add', array, value);
}

/**
 * Surrounds a string to the begging an end of each element in an array.
 * @param array The array you want to surround.
 * @param surroundChar1 The character placed in the beginning of the element.
 * @param surroundChar2 The character placed in the end of the element. Defaults to `surroundChar1`.
 */
export function surroundArray(array: string[], surroundChar1: string, surroundChar2?: string): string[] {
	return array.map((a) => `${surroundChar1}${a}${surroundChar2 ?? surroundChar1}`);
}

/**
 * Gets the duration from a specified string.
 * @param content The string to look for a duration in.
 * @param remove Whether or not to remove the duration from the original string.
 * @returns The {@link ParsedDuration}.
 */
export function parseDuration(content: string, remove = true): ParsedDuration {
	if (!content) return { duration: 0, content: null };

	// eslint-disable-next-line prefer-const
	let duration: number | null = null;
	// Try to reduce false positives by requiring a space before the duration, this makes sure it still matches if it is
	// in the beginning of the argument
	let contentWithoutTime = ` ${content}`;

	for (const unit in timeUnits) {
		const regex = timeUnits[unit as keyof typeof timeUnits].match;
		const match = regex.exec(contentWithoutTime);
		const value = Number(match?.groups?.[unit]);
		if (!isNaN(value)) duration! += value * timeUnits[unit as keyof typeof timeUnits].value;

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
export function humanizeDuration(duration: number, largest?: number, round = true): string {
	if (largest) return humanizeDurationMod(duration, { language: 'en', maxDecimalPoints: 2, largest, round })!;
	else return humanizeDurationMod(duration, { language: 'en', maxDecimalPoints: 2, round })!;
}

/**
 * Creates a formatted relative timestamp from a duration in milliseconds.
 * @param duration The duration in milliseconds.
 * @returns The formatted relative timestamp.
 */
export function timestampDuration(duration: number): string {
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
export function timestamp<D extends Date | undefined | null>(
	date: D,
	style: TimestampStyle = 'f'
): D extends Date ? string : undefined {
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
export function dateDelta(date: Date, largest?: number, round = true): string {
	return humanizeDuration(new Date().getTime() - date.getTime(), largest ?? 3, round);
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
export function timestampAndDelta(date: Date, style: TimestampStyle = 'D'): string {
	return `${timestamp(date, style)} (${dateDelta(date)} ago)`;
}

/**
 * Convert a hex code to an rbg value.
 * @param hex The hex code to convert.
 * @returns The rbg value.
 */
export function hexToRgb(hex: string): string {
	const arrBuff = new ArrayBuffer(4);
	const vw = new DataView(arrBuff);
	vw.setUint32(0, parseInt(hex, 16), false);
	const arrByte = new Uint8Array(arrBuff);

	return `${arrByte[1]}, ${arrByte[2]}, ${arrByte[3]}`;
}

/**
 * Wait an amount in milliseconds.
 * @returns A promise that resolves after the specified amount of milliseconds
 */
export const sleep = promisify(setTimeout);

/**
 * List the methods of an object.
 * @param obj The object to get the methods of.
 * @returns A string with each method on a new line.
 */
export function getMethods(obj: Record<string, any>): string {
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
export function getSymbols(obj: Record<string, any>): symbol[] {
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
 * Checks if a user has a certain guild permission (doesn't check channel permissions).
 * @param message The message to check the user from.
 * @param permissions The permissions to check for.
 * @returns The missing permissions or null if none are missing.
 */
export function userGuildPermCheck(
	message: CommandMessage | SlashMessage,
	permissions: typeof PermissionFlagsBits[keyof typeof PermissionFlagsBits][]
): PermissionsString[] | null {
	if (!message.inGuild()) return null;
	const missing = message.member?.permissions.missing(permissions) ?? [];

	return missing.length ? missing : null;
}

/**
 * Check if the client has certain permissions in the guild (doesn't check channel permissions).
 * @param message The message to check the client user from.
 * @param permissions The permissions to check for.
 * @returns The missing permissions or null if none are missing.
 */
export function clientGuildPermCheck(message: CommandMessage | SlashMessage, permissions: bigint[]): PermissionsString[] | null {
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
export function clientSendAndPermCheck(
	message: CommandMessage | SlashMessage,
	permissions: bigint[] = [],
	checkChannel = false
): PermissionsString[] | null {
	const missing: PermissionsString[] = [];
	const sendPerm = message.channel!.isThread() ? 'SendMessages' : 'SendMessagesInThreads';
	if (!message.inGuild()) return null;

	if (!message.guild.members.me!.permissionsIn(message.channel!.id).has(sendPerm)) missing.push(sendPerm);

	missing.push(
		...(checkChannel
			? message.guild!.members.me!.permissionsIn(message.channel!.id!).missing(permissions)
			: clientGuildPermCheck(message, permissions) ?? [])
	);

	return missing.length ? missing : null;
}

export { deepLock as deepFreeze };
export { Arg as arg };
export { Format as format };
export { DiscordConstants as discordConstants };
export { AkairoUtil as akairo };

/**
 * The link to invite the bot with all permissions.
 */
export function invite(client: BushClient) {
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
export function assertAll(...args: any[]): void {
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
export async function castDurationContent(
	arg: string | ParsedDuration | null,
	message: CommandMessage | SlashMessage
): Promise<ParsedDurationRes> {
	const res = typeof arg === 'string' ? await Arg.cast('contentWithDuration', message, arg) : arg;

	return { duration: res?.duration ?? 0, content: res?.content ?? '' };
}

/**
 * Casts a string to a the specified argument type.
 * @param type The type of the argument to cast to.
 * @param arg The argument received.
 * @param message The message that triggered the command.
 * @returns The casted argument.
 */
export async function cast<T extends keyof BaseBushArgumentType>(
	type: T,
	arg: BaseBushArgumentType[T] | string,
	message: CommandMessage | SlashMessage
) {
	return typeof arg === 'string' ? await Arg.cast(type, message, arg) : arg;
}

/**
 * Overflows the description of an embed into multiple embeds.
 * @param embed The options to be applied to the (first) embed.
 * @param lines Each line of the description as an element in an array.
 */
export function overflowEmbed(embed: Omit<APIEmbed, 'description'>, lines: string[], maxLength = 4096): EmbedBuilder[] {
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

/**
 * Formats an error into a string.
 * @param error The error to format.
 * @param colors Whether to use colors in the output.
 * @returns The formatted error.
 */
export function formatError(error: Error | any, colors = false): string {
	if (!error) return error;
	if (typeof error !== 'object') return String.prototype.toString.call(error);
	if (
		getSymbols(error)
			.map((s) => s.toString())
			.includes('Symbol(nodejs.util.inspect.custom)')
	)
		return inspect(error, { colors });

	return error.stack;
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

export interface ParsedDuration {
	duration: number | null;
	content: string | null;
}

export interface ParsedDurationRes {
	duration: number;
	content: string;
}

export type TimestampStyle = 't' | 'T' | 'd' | 'D' | 'f' | 'F' | 'R';
