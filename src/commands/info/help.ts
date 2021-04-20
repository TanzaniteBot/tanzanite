import { BushCommand, PermissionLevel } from '../../lib/extensions/BushCommand';
import { Message, MessageEmbed } from 'discord.js';
import db from '../../constants/db';

export default class HelpCommand extends BushCommand {
	public constructor() {
		super('help', {
			aliases: ['help'],
			description: {
				content: 'Displays a list of commands, or detailed information for a specific command.',
				usage: 'help [command]',
				examples: 'help price'
			},
			category: 'info',
			clientPermissions: ['EMBED_LINKS', 'SEND_MESSAGES'],
			ratelimit: 2,
			args: [
				{
					id: 'command',
					type: 'commandAlias'
				}
			]
		});
	}

	// eslint-disable-next-line require-await
	public async exec(message: Message, { command }: { command: BushCommand }): Promise<Message | Message[]> {
		const prefix = await db.guildGet('prefix', message.guild.id, this.client.config.defaultPrefix);
		if (!command) {
			const embed = new MessageEmbed()
				.setColor(this.client.consts.DefaultColor)
				/*.addField(
					'Commands',
					stripIndent`A list of available commands.
For additional info on a command, type \`${prefix}help <command>\`
`
				);*/
				.setTimestamp();
			if (message.guild) {
				embed.setFooter(`For more information about a command use '${prefix}help <command>'`);
			}
			const superUsers: string[] = (await db.globalGet('superUsers', [])) as string[];
			for (const [name, category] of this.handler.categories) {
				if (name == 'mb' && message.guild?.id != '516977525906341928') continue;
				if (name == 'dev' && !this.client.config.owners.includes(message.author.id)) continue;
				category.filter(command => {
					if (this.client.ownerID.includes(message.author.id)) return true;
					if (command.hidden) return false;
					if (command.channel == 'guild' && !message.guild) return false;
					if (command.permissionLevel == PermissionLevel.Owner && !this.client.config.owners.includes(message.author.id)) return false;
					if (command.permissionLevel == PermissionLevel.Superuser && !(superUsers.includes(message.author.id) || this.client.ownerID.includes(message.author.id))) {
						return false;
					}
					return true;
				});

				embed.addField(
					`${category.id.replace(/(\b\w)/gi, (lc): string => lc.toUpperCase())}`,
					`${category
						.filter((cmd): boolean => cmd.aliases.length > 0)
						.map((cmd): string => `\`${cmd.aliases[0]}\``)
						.join(' ')}`
				);
			}
			return message.util.reply(embed);
		}

		const embed = new MessageEmbed()
			.setColor([155, 200, 200])
			.setTitle(`\`${command.description.usage ? command.description.usage : ''}\``)
			.addField('Description', `${command.description.content ? command.description.content : ''} ${command.ownerOnly ? '\n__Owner Only__' : ''}`);

		if (command.aliases.length > 1) embed.addField('Aliases', `\`${command.aliases.join('` `')}\``, true);
		if (command.description.examples && command.description.examples.length) embed.addField('Examples', `\`${command.description.examples.join('`\n`')}\``, true);

		return message.util.reply(embed);
	}
}
