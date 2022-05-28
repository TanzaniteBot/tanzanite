import { Severity } from '@sentry/types';
import { ContextMenuCommand, ContextMenuCommandHandlerEvents } from 'discord-akairo';
import { ContextMenuCommandInteraction, EmbedBuilder, GuildTextBasedChannel } from 'discord.js';
import { BushListener } from '../../lib/extensions/discord-akairo/BushListener.js';
import CommandErrorListener, { IFuckedUpError } from '../commands/commandError.js';

export default class ContextCommandErrorListener extends BushListener {
	public constructor() {
		super('contextCommandError', {
			emitter: 'contextMenuCommandHandler',
			event: 'error',
			category: 'contextCommands'
		});
	}

	public override exec(...[error, interaction, command]: ContextMenuCommandHandlerEvents['error']) {
		return ContextCommandErrorListener.handleError(error, interaction, command);
	}

	public static async handleError(...[error, interaction, command]: ContextMenuCommandHandlerEvents['error']) {
		try {
			const errorNum = Math.floor(Math.random() * 6969696969) + 69; // hehe funny number
			const channel = interaction.channel?.isDM()
				? interaction.channel.recipient?.tag
				: (<GuildTextBasedChannel>interaction.channel)?.name;

			client.sentry.captureException(error, {
				level: Severity.Error,
				user: { id: interaction.user.id, username: interaction.user.tag },
				extra: {
					'command.name': command?.id,
					'message.id': interaction.id,
					'message.type': 'context command',
					'channel.id':
						(interaction.channel?.isDM() ? interaction.channel.recipient?.id : interaction.channel?.id) ?? '¯\\_(ツ)_/¯',
					'channel.name': channel,
					'guild.id': interaction.guild?.id ?? '¯\\_(ツ)_/¯',
					'guild.name': interaction.guild?.name ?? '¯\\_(ツ)_/¯',
					'environment': client.config.environment
				}
			});

			void client.console.error(
				`contextCommandError`,
				`an error occurred with the <<${command}>> context command in <<${channel}>> triggered by <<${
					interaction?.user?.tag
				}>>:\n${util.formatError(error)}`,
				false
			);

			const _haste = CommandErrorListener.getErrorHaste(error);
			const _stack = CommandErrorListener.getErrorStack(error);
			const [haste, stack] = await Promise.all([_haste, _stack]);
			const options = { interaction, error, errorNum, command, channel, haste, stack };

			const errorEmbed = this._generateErrorEmbed({
				...options,
				type: 'command-log'
			});

			void client.logger.channelError({ embeds: [errorEmbed] });

			if (interaction) {
				if (!client.config.owners.includes(interaction.user.id)) {
					const errorUserEmbed = this._generateErrorEmbed({
						...options,
						type: 'command-user'
					});
					void interaction?.reply({ embeds: [errorUserEmbed] }).catch(() => null);
				} else {
					const errorDevEmbed = this._generateErrorEmbed({
						...options,
						type: 'command-dev'
					});

					void interaction?.reply({ embeds: [errorDevEmbed] }).catch(() => null);
				}
			}
		} catch (e) {
			throw new IFuckedUpError('An error occurred while handling a command error.', error, e);
		}
	}

	private static _generateErrorEmbed(options: {
		interaction: ContextMenuCommandInteraction;
		error: Error | any;
		type: 'command-log' | 'command-dev' | 'command-user';
		errorNum: number;
		command?: ContextMenuCommand;
		channel?: string;
		haste: string[];
		stack: string;
	}): EmbedBuilder {
		const embed = new EmbedBuilder().setColor(util.colors.error).setTimestamp();
		if (options.type === 'command-user') {
			return embed
				.setTitle('An Error Occurred')
				.setDescription(
					`Oh no! ${
						options.command ? `While running the command ${util.format.input(options.command.id)}, a` : 'A'
					}n error occurred. Please give the developers code ${util.format.input(`${options.errorNum}`)}.`
				);
		}
		const description: string[] = [];

		if (options.type === 'command-log') {
			description.push(
				`**User:** ${options.interaction.user} (${options.interaction.user.tag})`,
				`**Command:** ${options.command ?? 'N/A'}`,
				`**Channel:** <#${options.interaction.channel?.id}> (${options.channel})`
			);
		}

		description.push(...options.haste);

		embed.addFields([{ name: 'Stack Trace', value: options.stack.substring(0, 1024) }]);
		if (description.length) embed.setDescription(description.join('\n').substring(0, 4000));

		if (options.type === 'command-dev' || options.type === 'command-log')
			embed.setTitle(`ContextCommandError #${util.format.input(`${options.errorNum}`)}`);
		return embed;
	}
}
