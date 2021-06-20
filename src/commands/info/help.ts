import { MessageEmbed } from 'discord.js';
import { BushCommand } from '../../lib/extensions/BushCommand';
import { BushInteractionMessage } from '../../lib/extensions/BushInteractionMessage';
import { BushMessage } from '../../lib/extensions/BushMessage';

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

	private generateEmbed(command?: BushCommand, message?: BushInteractionMessage | BushMessage): MessageEmbed {
		const prefix = this.client.config.dev ? 'dev ' : message.util.parsed.prefix;
		if (!command) {
			const embed = new MessageEmbed()
				.setFooter(`For more information about a command use '${prefix}help <command>'`)
				.setTimestamp()
				.setColor(this.client.util.colors.default);
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

	public async exec(
		message: BushMessage | BushInteractionMessage,
		{ command }: { command: BushCommand | string }
	): Promise<void> {
		const parsedCommand = message.util.isSlash
			? (this.handler.findCommand(command as string) as BushCommand)
			: (command as BushCommand);
		await message.util.send({ embeds: [this.generateEmbed(parsedCommand, message)] });
	}
}
