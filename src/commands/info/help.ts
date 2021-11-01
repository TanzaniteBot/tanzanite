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
				usage: ['help [command]'],
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
				{ id: 'showHidden', match: 'flag', flag: '--hidden' }
			],
			slash: true,
			slashOptions: [
				{
					name: 'command',
					description: 'What command do you need help with?',
					type: 'STRING',
					required: false
				}
			],
			clientPermissions: (m) => util.clientSendAndPermCheck(m, ['EMBED_LINKS'], true),
			userPermissions: []
		});
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		args: { command: BushCommand | string; showHidden?: boolean }
	) {
		const prefix = util.prefix(message);
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
					return !(command.restrictedGuilds?.includes(message.guild?.id ?? '') === false && !args.showHidden);
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
			.setTitle(`${command.id} Command`)
			.setDescription(`${command.description?.content ?? '*This command does not have a description.*'}`);
		if (command.description?.usage?.length) {
			embed.addField(
				`» Usage${command.description.usage.length > 1 ? 's' : ''}`,
				command.description.usage.map((u) => `\`${u}\``).join('\n')
			);
		}
		if (command.description?.examples?.length) {
			embed.addField(
				`» Example${command.description.examples.length > 1 ? 's' : ''}`,
				command.description.examples.map((u) => `\`${u}\``).join('\n')
			);
		}
		if (command.aliases?.length > 1) embed.addField('» Aliases', `\`${command.aliases.join('` `')}\``);
		if (
			command.ownerOnly ||
			command.superUserOnly ||
			command.hidden ||
			command.channel ||
			command.restrictedChannels?.length ||
			command.restrictedGuilds?.length
		) {
			const restrictions: string[] = [];
			if (command.ownerOnly) restrictions.push('__Developer Only__');
			if (command.ownerOnly) restrictions.push('__Super User Only__');
			if (command.hidden) restrictions.push('__Hidden__');
			if (command.channel === 'dm') restrictions.push('__DM Only__');
			if (command.channel === 'guild') restrictions.push('__Server Only__');
			if (command.restrictedChannels?.length)
				restrictions.push(`__Restricted Channels__: ${command.restrictedChannels.map((c) => `<#${c}>`).join(' ')}`);
			if (command.restrictedGuilds?.length)
				restrictions.push(
					`__Restricted Servers__: ${command.restrictedGuilds
						.map((g) => util.format.inlineCode(client.guilds.cache.find((g1) => g1.id === g)?.name ?? 'Unknown'))
						.join(' ')}`
				);
			if (restrictions.length) embed.addField('» Restrictions', restrictions.join('\n'));
		}

		return await message.util.reply({ embeds: [embed], components: [row] });
	}
}
