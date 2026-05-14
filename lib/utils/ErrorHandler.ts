/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import type { BotCommandHandlerEvents } from '#lib/extensions/discord-akairo/BotCommandHandler.js';
import type { SlashMessage } from '#lib/extensions/discord-akairo/SlashMessage.js';
import type { TanzaniteClient } from '#lib/extensions/index.js';
import type { AkairoMessage, Command } from '@tanzanite/discord-akairo';
import { ChannelType, EmbedBuilder, escapeInlineCode, type Client, type GuildTextBasedChannel, type Message } from 'discord.js';
import { colors } from './Constants.js';
import { bold, input } from './Format.js';
import { capitalize, formatError } from './Utils.js';

export async function handleCommandError(
	client: Client,
	...[error, message, _command]: BotCommandHandlerEvents['error'] | BotCommandHandlerEvents['slashError']
) {
	try {
		const isSlash = message.util?.isSlash ?? false;
		const errorNum = Math.floor(Math.random() * 6969696969) + 69; // hehe funny number
		const channel =
			message.channel?.type === ChannelType.DM ? message.channel.recipient?.tag : (<GuildTextBasedChannel>message.channel)?.name;
		const command = _command ?? message.util?.parsed?.command;

		client.sentry.captureException(error, {
			level: 'error',
			user: { id: message.author.id, username: message.author.tag },
			extra: {
				'command.name': command?.id,
				'message.id': message.id,
				'message.type': message.util ? (isSlash ? 'slash' : 'normal') : 'unknown',
				'message.parsed.content': message.util?.parsed?.content,
				'channel.id':
					(message.channel?.type === ChannelType.DM ? message.channel.recipient?.id : message.channel?.id) ?? '¯\\_(ツ)_/¯',
				'channel.name': channel,
				'guild.id': message.guild?.id ?? '¯\\_(ツ)_/¯',
				'guild.name': message.guild?.name ?? '¯\\_(ツ)_/¯',
				'environment': client.config.environment
			}
		});

		void client.console.error(
			`${isSlash ? 'slashC' : 'c'}ommandError`,
			`an error occurred with the <<${command}>> ${isSlash ? 'slash ' : ''}command in <<${channel}>> triggered by <<${
				message?.author?.tag
			}>>:\n${formatError(error, true)}`,
			false
		);

		const _haste = getErrorHaste(client, error);
		const _stack = getErrorStack(client, error);
		const [haste, stack] = await Promise.all([_haste, _stack]);
		const options = { message, error, isSlash, errorNum, command, channel, haste, stack };

		const errorEmbed = _generateErrorEmbed({
			...options,
			type: 'command-log'
		});

		void client.logger.channelError({ embeds: errorEmbed });

		if (message != null) {
			if (!client.config.owners.includes(message.author.id)) {
				const errorUserEmbed = _generateErrorEmbed({
					...options,
					type: 'command-user'
				});
				void message.util?.send({ embeds: errorUserEmbed }).catch(() => null);
			} else {
				const errorDevEmbed = _generateErrorEmbed({
					...options,
					type: 'command-dev'
				});

				void message.util?.send({ embeds: errorDevEmbed }).catch(() => null);
			}
		}
	} catch (e) {
		throw new IFuckedUpError('An error occurred while handling a command error.', error, e);
	}
}

export async function generateErrorEmbed(
	client: TanzaniteClient,
	options:
		| {
				message: Message | AkairoMessage;
				error: Error | any;
				isSlash?: boolean;
				type: 'command-log' | 'command-dev' | 'command-user';
				errorNum: number;
				command?: Command;
				channel?: string;
		  }
		| { error: Error | any; type: 'uncaughtException' | 'unhandledRejection'; context?: string }
): Promise<EmbedBuilder[]> {
	const _haste = getErrorHaste(client, options.error);
	const _stack = getErrorStack(client, options.error);
	const [haste, stack] = await Promise.all([_haste, _stack]);

	return _generateErrorEmbed({ ...options, haste, stack });
}

function _generateErrorEmbed(
	options:
		| {
				message: Message | SlashMessage;
				error: Error | any;
				isSlash?: boolean;
				type: 'command-log' | 'command-dev' | 'command-user';
				errorNum: number;
				command?: Command;
				channel?: string;
				haste: string[];
				stack: string;
		  }
		| {
				error: Error | any;
				type: 'uncaughtException' | 'unhandledRejection';
				context?: string;
				haste: string[];
				stack: string;
		  }
): EmbedBuilder[] {
	const embeds = [new EmbedBuilder().setColor(colors.error)];
	if (options.type === 'command-user') {
		embeds[0]
			.setTitle('An Error Occurred')
			.setDescription(
				`Oh no! ${
					options.command
						? `While running the ${(options.isSlash ?? false) ? 'slash ' : ''}command ${input(options.command.id)}, a`
						: 'A'
				}n error occurred. Please give the developers code ${input(`${options.errorNum}`)}.`
			)
			.setTimestamp();
		return embeds;
	}
	const description: string[] = [];

	if (options.type === 'command-log') {
		description.push(
			`**User:** ${options.message.author} (${options.message.author.tag})`,
			`**Command:** ${options.command ?? 'N/A'}`,
			`**Channel:** <#${options.message.channel?.id}> (${options.channel})`,
			`**Message:** [link](${options.message.url})`
		);
		if (options.message?.util?.parsed?.content ?? '')
			description.push(`**Command Content:** ${options.message.util!.parsed!.content}`);
	}

	description.push(...options.haste);

	embeds.push(new EmbedBuilder().setColor(colors.error).setTimestamp().setDescription(options.stack.substring(0, 4000)));
	if (description.length) embeds[0].setDescription(description.join('\n').substring(0, 4000));

	if (options.type === 'command-dev' || options.type === 'command-log')
		embeds[0].setTitle(`${options.isSlash === true ? 'Slash ' : ''}CommandError #${input(`${options.errorNum}`)}`);
	else if (options.type === 'uncaughtException')
		embeds[0].setTitle(`${(options.context ?? '') ? `[${bold(options.context!)}] An Error Occurred` : 'Uncaught Exception'}`);
	else if (options.type === 'unhandledRejection')
		embeds[0].setTitle(
			`${(options.context ?? '') ? `[${bold(options.context!)}] An Error Occurred` : 'Unhandled Promise Rejection'}`
		);
	return embeds;
}

export async function getErrorHaste(client: Client, error: Error | any): Promise<string[]> {
	const inspectOptions = {
		showHidden: false,
		depth: 9,
		colors: false,
		customInspect: true,
		showProxy: false,
		maxArrayLength: Infinity,
		maxStringLength: Infinity,
		breakLength: 80,
		compact: 3,
		sorted: false,
		getters: true
	};

	const ret: string[] = [];
	const promises: Promise<{
		url?: string | undefined;
		error?: 'content too long' | 'substr' | 'unable to post' | undefined;
	}>[] = [];
	const pair: {
		[key: string]: {
			url?: string | undefined;
			error?: 'content too long' | 'substr' | 'unable to post' | undefined;
		};
	} = {};

	for (const element in error) {
		if (['stack', 'name', 'message'].includes(element)) continue;
		else if (typeof error[element] === 'object') {
			promises.push(client.utils.inspectCleanRedactHaste(error[element], inspectOptions));
		}
	}

	const links = await Promise.all(promises);

	let index = 0;
	for (const element in error) {
		if (['stack', 'name', 'message'].includes(element)) continue;
		else if (typeof error[element] === 'object') {
			pair[element] = links[index];
			index++;
		}
	}

	for (const element in error) {
		if (['stack', 'name', 'message'].includes(element)) continue;
		else {
			ret.push(
				`**Error ${capitalize(element)}:** ${
					typeof error[element] === 'object'
						? `${
								pair[element].url != null
									? `[haste](${pair[element].url})${pair[element].error ? ` - ${pair[element].error}` : ''}`
									: pair[element].error
							}`
						: `\`${escapeInlineCode(client.utils.inspectAndRedact(error[element], inspectOptions))}\``
				}`
			);
		}
	}
	return ret;
}

export async function getErrorStack(client: Client, error: Error | any): Promise<string> {
	return await client.utils.inspectCleanRedactCodeblock(error, 'js', { colors: false }, 4000);
}

export class IFuckedUpError extends Error {
	declare public original: Error | any;
	declare public newError: Error | any;

	public constructor(message: string, original?: Error | any, newError?: Error | any) {
		super(message);
		this.name = 'IFuckedUpError';
		this.original = original;
		this.newError = newError;
	}
}
