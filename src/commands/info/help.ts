import { BushCommand, BushMessage, BushSlashMessage } from '@lib';
import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import packageDotJSON from '../../../package.json';
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
			],
			clientPermissions: ['EMBED_LINKS', 'SEND_MESSAGES'],
			userPermissions: ['SEND_MESSAGES']
		});
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		args: { command: BushCommand | string; showHidden?: boolean }
	): Promise<unknown> {
		const prefix = message.util.isSlash
			? '/'
			: client.config.isDevelopment
			? 'dev '
			: message.util.parsed?.prefix ?? client.config.prefix;
		const row = new MessageActionRow();

		if (!client.config.isDevelopment && !client.guilds.cache.some((guild) => guild.ownerId === message.author.id)) {
			row.addComponents(
				new MessageButton({
					style: 'LINK',
					label: 'Invite Me',
					url: `https://discord.com/api/oauth2/authorize?client_id=${
						client.user!.id
					}&permissions=5368709119918&scope=bot%20applications.commands`
				})
			);
		}
		if (!client.guilds.cache.get(client.config.supportGuild.id)?.members.cache.has(message.author.id)) {
			row.addComponents(
				new MessageButton({
					style: 'LINK',
					label: 'Support Server',
					url: client.config.supportGuild.invite
				})
			);
		}
		row.addComponents(
			new MessageButton({
				style: 'LINK',
				label: 'GitHub',
				url: packageDotJSON.repository
			})
		);

		const isOwner = client.isOwner(message.author);
		const isSuperUser = client.isSuperUser(message.author);
		const command = args.command
			? typeof args.command === 'string'
				? client.commandHandler.modules.get(args.command) ?? null
				: args.command
			: null;
		if (!isOwner) args.showHidden = false;
		if (!command || command.pseudo) {
			const embed = new MessageEmbed().setColor(util.colors.default).setTimestamp();
			embed.setFooter(`For more information about a command use ${prefix}help <command>`);
			for (const [, category] of this.handler.categories) {
				const categoryFilter = category.filter((command) => {
					if (command.pseudo) return false;
					if (command.hidden && !args.showHidden) return false;
					if (command.channel == 'guild' && !message.guild && !args.showHidden) return false;
					if (command.ownerOnly && !isOwner) return false;
					if (command.superUserOnly && !isSuperUser) {
						return false;
					}
					// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
					return !(command.restrictedGuilds?.includes(message.guild?.id!) === false && !args.showHidden);
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
			return await message.util.reply({ embeds: [embed], components: [row] });
		}

		const embed = new MessageEmbed()
			.setColor(util.colors.default)
			.setTitle(`\`${command.description?.usage || `${util.emojis.error} This command does not have usages.`}\``)
			.addField(
				'Description',
				`${command.description?.content || `${util.emojis.error} This command does not have a description.`} ${
					command.ownerOnly ? '\n__Developer Only__' : ''
				} ${command.superUserOnly ? '\n__Super User Only__' : ''}`
			);

		if (command.aliases?.length > 1) embed.addField('Aliases', `\`${command.aliases.join('` `')}\``, true);
		if (command.description?.examples?.length) {
			embed.addField('Examples', `\`${command.description.examples.join('`\n`')}\``, true);
		}

		return await message.util.reply({ embeds: [embed], components: [row] });
	}
}
