import { BushCommand, BushMessage, BushSlashMessage } from '@lib';
import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';

export default class HelpCommand extends BushCommand {
	public constructor() {
		super('help', {
			aliases: ['help'],
			category: 'info',
			description: {
				content: 'Displays a list of commands, or detailed information for a specific command.',
				usage: 'help [command]',
				examples: ['help prefix']
			},
			clientPermissions: ['EMBED_LINKS'],

			args: [
				{
					id: 'command',
					type: 'commandAlias',
					match: 'content',
					prompt: {
						start: 'What command do you need help with?',
						retry: '{error} Choose a valid command to find help for.',
						optional: true
					}
				},
				{
					id: 'showHidden',
					match: 'flag',
					flag: '--hidden'
				}
			],
			slash: true,
			slashOptions: [
				{
					name: 'command',
					description: 'The command you would like to find information about.',
					type: 'STRING',
					required: false
				}
			]
		});
	}

	public async exec(
		message: BushMessage | BushSlashMessage,
		args: { command: BushCommand | string; showHidden?: boolean }
	): Promise<unknown> {
		const prefix = this.client.config.dev ? 'dev ' : message.util.parsed.prefix;
		let ButtonRow: MessageActionRow;
		if (!this.client.config.dev) {
			ButtonRow = new MessageActionRow().addComponents(
				new MessageButton({
					style: 'LINK',
					label: 'Invite Me',
					url: `https://discord.com/api/oauth2/authorize?client_id=${this.client.user.id}&permissions=2147483647&scope=bot%20applications.commands`
				})
			);
		}
		const isOwner = this.client.isOwner(message.author);
		const isSuperUser = this.client.isSuperUser(message.author);
		const command = args.command
			? typeof args.command === 'string'
				? this.client.commandHandler.modules.get(args.command) || null
				: args.command
			: null;
		if (!isOwner) args.showHidden = false;
		if (!command) {
			const embed = new MessageEmbed().setColor(this.client.util.colors.default).setTimestamp();
			if (message.guild) {
				embed.setFooter(`For more information about a command use '${prefix}help <command>'`);
			}
			for (const [, category] of this.handler.categories) {
				const categoryFilter = category.filter((command) => {
					if (command.hidden && !args.showHidden) return false;
					if (command.channel == 'guild' && !message.guild && !args.showHidden) return false;
					if (command.ownerOnly && !isOwner) return false;
					if (command.superUserOnly && !isSuperUser) {
						return false;
					}
					return !(command.restrictedGuilds?.includes(message.guild.id) == false && !args.showHidden);
				});
				const categoryNice = category.id
					.replace(/(\b\w)/gi, (lc): string => lc.toUpperCase())
					.replace(/'(S)/g, (letter): string => letter.toLowerCase());
				const categoryCommands = categoryFilter
					.filter((cmd): boolean => cmd.aliases.length > 0)
					.map((cmd): string => `\`${cmd.aliases[0]}\``);
				if (categoryCommands.length > 0) {
					embed.addField(`${categoryNice}`, `${categoryCommands.join(' ')}`);
				}
			}
			return await message.util.reply({ embeds: [embed], components: ButtonRow ? [ButtonRow] : undefined });
		}

		const embed = new MessageEmbed()
			.setColor(this.client.util.colors.default)
			.setTitle(`\`${command.description?.usage ? command.description.usage : 'This command does not have usages.'}\``)
			.addField(
				'Description',
				`${command.description?.content ? command.description.content : '*This command does not have a description.*'} ${
					command.ownerOnly ? '\n__Dev Only__' : ''
				} ${command.superUserOnly ? '\n__Super User Only__' : ''}`
			);

		if (command.aliases?.length > 1) embed.addField('Aliases', `\`${command.aliases.join('` `')}\``, true);
		if (command.description?.examples && command.description.examples.length) {
			embed.addField('Examples', `\`${command.description.examples.join('`\n`')}\``, true);
		}

		return await message.util.reply({ embeds: [embed], components: ButtonRow ? [ButtonRow] : undefined });
	}
}
