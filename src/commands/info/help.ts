import { stripIndent } from 'common-tags';
import { Message, MessageEmbed } from 'discord.js';
import { SlashCommandOption } from '../../lib/extensions/BushClientUtil';
import { BushCommand } from '../../lib/extensions/BushCommand';
import { BushInteractionMessage } from '../../lib/extensions/BushInteractionMessage';

export default class HelpCommand extends BushCommand {
	constructor() {
		super('help', {
			aliases: ['help'],
			category: 'info',
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
			slashOptions: [
				{
					type: 'STRING',
					name: 'command',
					description: 'The command to get help for',
					required: false
				}
			],
			slash: true
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
				.setFooter(`For more information about a command use "${this.client.config.prefix}help <command>"`)
				.setTimestamp();
			for (const category of this.handler.categories.values()) {
				embed.addField(
					`${category.id.replace(/(\b\w)/gi, (lc): string => lc.toUpperCase())}`,
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
				.setTitle(`\`${command.description.usage ? command.description.usage : ''}\``)
				.addField(
					'Description',
					`${command.description.content ? command.description.content : ''} ${command.ownerOnly ? '\n__Owner Only__' : ''}`
				);

			if (command.aliases.length > 1) embed.addField('Aliases', `\`${command.aliases.join('` `')}\``, true);
			if (command.description.examples && command.description.examples.length)
				embed.addField('Examples', `\`${command.description.examples.join('`\n`')}\``, true);
			return embed;
		}
	}

	public async exec(message: Message, { command }: { command: BushCommand }): Promise<void> {
		await message.util.send({ embeds: [this.generateEmbed(command)] });
	}

	public async execSlash(message: BushInteractionMessage, { command }: { command: SlashCommandOption<string> }): Promise<void> {
		if (command) {
			await message.interaction.reply({ embeds: [this.generateEmbed(this.handler.findCommand(command.value) as BushCommand)] });
		} else {
			await message.interaction.reply({ embeds: [this.generateEmbed()] });
		}
	}
}
