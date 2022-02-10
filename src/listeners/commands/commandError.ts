import { type BushCommandHandlerEvents } from '#lib';
import { Severity } from '@sentry/types';
import { type AkairoMessage, type Command } from 'discord-akairo';
import { Embed, Formatters, GuildTextBasedChannel, type Message } from 'discord.js';
import { BushListener } from '../../lib/extensions/discord-akairo/BushListener.js';

export default class CommandErrorListener extends BushListener {
	public constructor() {
		super('commandError', {
			emitter: 'commandHandler',
			event: 'error'
		});
	}

	public override exec(...[error, message, command]: BushCommandHandlerEvents['error']) {
		return CommandErrorListener.handleError(error, message, command);
	}

	public static async handleError(
		...[error, message, _command]: BushCommandHandlerEvents['error'] | BushCommandHandlerEvents['slashError']
	) {
		const isSlash = message.util.isSlash;
		const errorNum = Math.floor(Math.random() * 6969696969) + 69; // hehe funny number
		const channel = message.channel?.isDM() ? message.channel?.recipient.tag : (<GuildTextBasedChannel>message.channel)?.name;
		const command = _command ?? message.util.parsed?.command;

		client.sentry.captureException(error, {
			level: Severity.Error,
			user: { id: message.author.id, username: message.author.tag },
			extra: {
				'command.name': command?.id,
				'message.id': message.id,
				'message.type': message.util.isSlash ? 'slash' : 'normal',
				'message.parsed.content': message.util.parsed?.content,
				'channel.id': message.channel?.isDM() ? message.channel?.recipient.id : (<GuildTextBasedChannel>message.channel)?.id,
				'channel.name': channel,
				'guild.id': message.guild?.id,
				'guild.name': message.guild?.name,
				'environment': client.config.environment
			}
		});

		void client.console.error(
			`${isSlash ? 'slashC' : 'c'}ommandError`,
			`an error occurred with the <<${command}>> ${isSlash ? 'slash ' : ''}command in <<${channel}>> triggered by <<${
				message?.author?.tag
			}>>:\n${error?.stack ?? <any>error}`,
			false
		);

		const _haste = CommandErrorListener.getErrorHaste(error);
		const _stack = CommandErrorListener.getErrorStack(error);
		const [haste, stack] = await Promise.all([_haste, _stack]);
		const options = { message, error, isSlash, errorNum, command, channel, haste, stack };

		const errorEmbed = CommandErrorListener._generateErrorEmbed({
			...options,
			type: 'command-log'
		});

		void client.logger.channelError({ embeds: [errorEmbed] });

		if (message) {
			if (!client.config.owners.includes(message.author.id)) {
				const errorUserEmbed = CommandErrorListener._generateErrorEmbed({
					...options,
					type: 'command-user'
				});
				void message.util?.send({ embeds: [errorUserEmbed] }).catch(() => null);
			} else {
				const errorDevEmbed = CommandErrorListener._generateErrorEmbed({
					...options,
					type: 'command-dev'
				});

				void message.util?.send({ embeds: [errorDevEmbed] }).catch(() => null);
			}
		}
	}

	public static async generateErrorEmbed(
		options:
			| {
					message: Message | AkairoMessage;
					error: Error | any;
					isSlash: boolean;
					type: 'command-log' | 'command-dev' | 'command-user';
					errorNum: number;
					command?: Command;
					channel?: string;
			  }
			| { error: Error | any; type: 'uncaughtException' | 'unhandledRejection'; context?: string }
	): Promise<Embed> {
		const _haste = CommandErrorListener.getErrorHaste(options.error);
		const _stack = CommandErrorListener.getErrorStack(options.error);
		const [haste, stack] = await Promise.all([_haste, _stack]);

		return CommandErrorListener._generateErrorEmbed({ ...options, haste, stack });
	}

	private static _generateErrorEmbed(
		options:
			| {
					message: Message | AkairoMessage;
					error: Error | any;
					isSlash: boolean;
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
	): Embed {
		const embed = new Embed().setColor(util.colors.error).setTimestamp();
		if (options.type === 'command-user') {
			return embed
				.setTitle('An Error Occurred')
				.setDescription(
					`Oh no! ${
						options.command ? `While running the ${options.isSlash ? 'slash ' : ''}command \`${options.command.id}\`, a` : 'A'
					}n error occurred. Please give the developers code \`${options.errorNum}\`.`
				);
		}
		const description = new Array<string>();

		if (options.type === 'command-log') {
			description.push(
				`**User:** ${options.message.author} (${options.message.author.tag})`,
				`**Command:** ${options.command ?? 'N/A'}`,
				`**Channel:** <#${options.message.channel?.id}> (${options.channel})`,
				`**Message:** [link](${options.message.url})`
			);
			if (options.message?.util?.parsed?.content) description.push(`**Command Content:** ${options.message.util.parsed.content}`);
		}

		description.push(...options.haste);

		embed.addField({ name: 'Stack Trace', value: options.stack.substring(0, 1024) });
		if (description.length) embed.setDescription(description.join('\n').substring(0, 4000));

		if (options.type === 'command-dev' || options.type === 'command-log')
			embed.setTitle(`${options.isSlash ? 'Slash ' : ''}CommandError #\`${options.errorNum}\``);
		else if (options.type === 'uncaughtException')
			embed.setTitle(`${options.context ? `[${Formatters.bold(options.context)}] An Error Occurred` : 'Uncaught Exception'}`);
		else if (options.type === 'unhandledRejection')
			embed.setTitle(
				`${options.context ? `[${Formatters.bold(options.context)}] An Error Occurred` : 'Unhandled Promise Rejection'}`
			);
		return embed;
	}

	public static async getErrorHaste(error: Error | any): Promise<string[]> {
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
			else if (typeof (error as any)[element] === 'object') {
				promises.push(util.inspectCleanRedactHaste((error as any)[element], inspectOptions));
			}
		}

		const links = await Promise.all(promises);

		let index = 0;
		for (const element in error) {
			if (['stack', 'name', 'message'].includes(element)) continue;
			else if (typeof (error as any)[element] === 'object') {
				pair[element] = links[index];
				index++;
			}
		}

		for (const element in error) {
			if (['stack', 'name', 'message'].includes(element)) continue;
			else {
				ret.push(
					`**Error ${util.capitalizeFirstLetter(element)}:** ${
						typeof (error as any)[element] === 'object'
							? `${
									pair[element].url
										? `[haste](${pair[element].url})${pair[element].error ? ` - ${pair[element].error}` : ''}`
										: pair[element].error
							  }`
							: `\`${util.discord.escapeInlineCode(util.inspectAndRedact((error as any)[element], inspectOptions))}\``
					}`
				);
			}
		}
		return ret;
	}

	public static async getErrorStack(error: Error | any): Promise<string> {
		return await util.inspectCleanRedactCodeblock(error?.stack ?? error, 'js');
	}
}
