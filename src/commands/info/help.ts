import { Command } from 'discord-akairo'
import { Message, MessageEmbed } from 'discord.js'
import { stripIndent } from 'common-tags'
import BotClient from '../../client/BotClient'

export default class HelpCommand extends Command {
	public constructor() {
		super('help', {
			aliases: ['help'],
			description: {
				content: 'Displays a list of commands, or detailed information for a specific command.',
				usage: 'help [command]'
			},
			category: 'info',
			clientPermissions: ['EMBED_LINKS'],
			ratelimit: 2,
			args: [
				{
					id: 'command',
					type: 'commandAlias'
				}
			]
		})
	}

	public async exec(message: Message, { command }: { command: Command }): Promise<Message | Message[]> {
		const client = <BotClient> this.client
		const prefix = this.handler.prefix
		if (!command) {
			const embed = new MessageEmbed()
				.setColor(client.consts.DefaultColor)
				.addField('Commands', stripIndent`A list of available commands.
                    For additional info on a command, type \`${prefix}help <command>\`
                `)

			for (const category of this.handler.categories.values()) {
				embed.addField(`${category.id.replace(/(\b\w)/gi, (lc): string => lc.toUpperCase())}`, `${category.filter((cmd): boolean => cmd.aliases.length > 0).map((cmd): string => `\`${cmd.aliases[0]}\``).join(' ')}`)
			}

			return message.util.send(embed)
		}

		const embed = new MessageEmbed()
			.setColor([155, 200, 200])
			.setTitle(`\`${command.description.usage ? command.description.usage : ''}\``)
			.addField('Description', `${command.description.content ? command.description.content : ''} ${command.ownerOnly ? '\n__Owner Only__': ''}`)

		if (command.aliases.length > 1) embed.addField('Aliases', `\`${command.aliases.join('` `')}\``, true)
		if (command.description.examples && command.description.examples.length) embed.addField('Examples', `\`${command.description.examples.join('`\n`')}\``, true)

		return message.util.send(embed)
	}
}