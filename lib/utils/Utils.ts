import { Util as AkairoUtil } from '@notenoughupdates/discord-akairo';
import { humanizeDuration as humanizeDurationMod } from '@notenoughupdates/humanize-duration';
import deepLock from '@tanzanite/deep-lock';
import assert from 'assert/strict';
import cp from 'child_process';
import {
	ActionRowBuilder,
	APITextInputComponent,
	Constants as DiscordConstants,
	EmbedBuilder,
	Message,
	OAuth2Scopes,
	PermissionFlagsBits,
	PermissionsBitField,
	PermissionsString,
	TextInputBuilder,
	TextInputComponentData,
	type APIEmbed,
	type APIMessage,
	type CommandInteraction,
	type InteractionReplyOptions
} from 'discord.js';
import { sep } from 'path';
import { DeepWritable } from 'ts-essentials';
import { inspect as inspectUtil, promisify } from 'util';
import { BaseBotArgumentType, CommandMessage } from '../extensions/discord-akairo/BotCommand.js';
import { SlashMessage } from '../extensions/discord-akairo/SlashMessage.js';
import { TanzaniteClient } from '../extensions/discord-akairo/TanzaniteClient.js';
import { CustomInspectOptions } from '../types/InspectOptions.js';
import { SlashEditMessageType, SlashSendMessageType } from '../types/misc.js';
import * as Arg from './Arg.js';
import { mappings, timeUnits } from './Constants.js';
import * as Format from './Format.js';

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
	const apiRes = (await fetch(`https://api.ashcon.app/mojang/v2/user/${username}`).then((p) =>
		p.ok ? p.json() : undefined
	)) as UuidRes;

	// this will throw an error if response is not ok
	return dashed ? apiRes.uuid : apiRes.uuid.replace(/-/g, '');
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

/**
 * Generate defaults for {@link inspect}.
 * @param options The options to create defaults with.
 * @returns The default options combined with the specified options.
 */
function getDefaultInspectOptions(options?: CustomInspectOptions): CustomInspectOptions {
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
		getters: options?.getters ?? true,
		numericSeparator: options?.numericSeparator ?? true
	};
}

/**
 * Uses {@link inspect} with custom defaults.
 * @param object - The object you would like to inspect.
 * @param options - The options you would like to use to inspect the object.
 * @returns The inspected object.
 */
export function inspect(object: any, options?: CustomInspectOptions): string {
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
		await interaction.reply(newResponseOptions as SlashSendMessageType);
		return await interaction.fetchReply().catch(() => undefined);
	}
}

/**
 * A shortcut for {@link Intl.ListFormat.format}
 * @param list The list to format.
 * @param type The conjunction to use: `conjunction` 🡒 `and`, `disjunction` 🡒 `or`
 * @returns The formatted list.
 */
export function formatList(list: Iterable<string>, type: Intl.ListFormatType | 'and' | 'or'): string | undefined {
	if (type === 'and') type = 'conjunction';
	if (type === 'or') type = 'disjunction';

	const formatter = new Intl.ListFormat('en', { style: 'long', type });

	return formatter.format(list);
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
export function surroundEach(array: string[], surroundChar1: string, surroundChar2?: string): string[] {
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

export interface ParsedDuration {
	duration: number | null;
	content: string | null;
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

export type TimestampStyle = 't' | 'T' | 'd' | 'D' | 'f' | 'F' | 'R';

/**
 * Creates a human readable representation between a date and the current time.
 * @param date The date to be compared with the current time.
 * @param largest The maximum number of units to display for the duration.
 * @param round Whether or not to round the smallest unit displayed.
 * @returns A humanized string of the delta.
 */
export function dateDelta(date: Date, largest = 3, round = true): string {
	return humanizeDuration(new Date().getTime() - date.getTime(), largest, round);
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

export * as arg from './Arg.js';
export { deepLock as deepFreeze };
export { Format as format };
export { DiscordConstants as discordConstants };
export { AkairoUtil as akairo };

/**
 * The link to invite the bot with all permissions.
 */
export function invite(client: TanzaniteClient) {
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

export interface ParsedDurationRes {
	duration: number;
	content: string;
}

/**
 * Casts a string to a the specified argument type.
 * @param type The type of the argument to cast to.
 * @param arg The argument received.
 * @param message The message that triggered the command.
 * @returns The casted argument.
 */
export async function cast<T extends keyof BaseBotArgumentType>(
	type: T,
	arg: BaseBotArgumentType[T] | string,
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

export function deepWriteable<T>(obj: T): DeepWritable<T> {
	return obj as DeepWritable<T>;
}

export function formatPerms(permissions: PermissionsString[]) {
	return permissions.map((p) => `\`${mappings.permissions[p]?.name ?? p}\``).join(', ');
}

export function ModalInput(options: Partial<TextInputComponentData | APITextInputComponent>): ActionRowBuilder<TextInputBuilder> {
	return new ActionRowBuilder<TextInputBuilder>({
		components: [new TextInputBuilder(options)]
	});
}

export function simplifyPath(path: string) {
	const dir = process.env.PROJECT_DIR;
	assert(dir, 'PROJECT_DIR is not defined');

	console.dir([path, dir]);

	return path
		.replaceAll(new RegExp(sep, 'g'), '/')
		.replaceAll(`${dir}/`, '')
		.replaceAll(/node\/.store\/.*?\/(node_modules)/g, '$1');
}
