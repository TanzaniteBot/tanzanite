import { Message, MessageEmbed } from 'discord.js';
import { BotCommand } from '../../lib/extensions/BotCommand';
import { stripIndent } from 'common-tags';
import { BotMessage } from '../../lib/extensions/BotMessage';

export default class HelpCommand extends BotCommand {
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
			]
		});
	}

	public async exec(
		message: BotMessage,
		{ command }: { command: BotCommand }
	): Promise<Message> {
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
			return message.util.send(embed);
		}

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

		return message.util.send(embed);
	}
}
