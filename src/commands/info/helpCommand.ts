import { Message, MessageEmbed } from 'discord.js';
import { BushCommand } from '../../lib/extensions/BushCommand';
import { stripIndent } from 'common-tags';
import { ApplicationCommandOptionType } from 'discord-api-types';
import { CommandInteraction } from 'discord.js';
import { SlashCommandOption } from '../../lib/extensions/Util';

export default class HelpCommand extends BushCommand {
	constructor() {
		super('help', {
			aliases: ['help'],
			description: {
				content: 'Shows the commands of the bot',
				usage: 'help',
				examples: ['help']
			},
			clientPermissions: ['EMBED_LINKS'],
			args: [
				{
					id: 'command',
					type: 'commandAlias'
				}
			],
			slashCommandOptions: [
				{
					type: ApplicationCommandOptionType.STRING,
					name: 'command',
					description: 'The command to get help for',
					required: false
				}
			]
		});
	}

	private generateEmbed(command?: BushCommand): MessageEmbed {
		const prefix = this.handler.prefix;
		if (!command) {
			const embed = new MessageEmbed()
				.addField(
					'Commands',
					stripIndent`A list of available commands.
                    For additional info on a command, type \`${prefix}help <command>\`
                `
				)
				.setFooter(
					`For more information about a command use "${this.client.config.prefix}help <command>"`
				)
				.setTimestamp();
			for (const category of this.handler.categories.values()) {
				embed.addField(
					`${category.id.replace(/(\b\w)/gi, (lc): string =>
						lc.toUpperCase()
					)}`,
					`${category
						.filter((cmd): boolean => cmd.aliases.length > 0)
						.map((cmd): string => `\`${cmd.aliases[0]}\``)
						.join(' ')}`
				);
			}
			return embed;
		} else {
			const embed = new MessageEmbed()
				.setColor([155, 200, 200])
				.setTitle(
					`\`${command.description.usage ? command.description.usage : ''}\``
				)
				.addField(
					'Description',
					`${command.description.content ? command.description.content : ''} ${
						command.ownerOnly ? '\n__Owner Only__' : ''
					}`
				);

			if (command.aliases.length > 1)
				embed.addField('Aliases', `\`${command.aliases.join('` `')}\``, true);
			if (command.description.examples && command.description.examples.length)
				embed.addField(
					'Examples',
					`\`${command.description.examples.join('`\n`')}\``,
					true
				);
			return embed;
		}
	}

	public async exec(
		message: Message,
		{ command }: { command: BushCommand }
	): Promise<void> {
		await message.util.send(this.generateEmbed(command));
	}

	public async execSlash(
		message: CommandInteraction,
		{ command }: { command: SlashCommandOption<string> }
	): Promise<void> {
		if (command) {
			await message.reply(
				this.generateEmbed(
					this.handler.findCommand(command.value) as BushCommand
				)
			);
		} else {
			await message.reply(this.generateEmbed());
		}
	}
}
