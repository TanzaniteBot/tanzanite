import { BushCommand, type ArgType, type BushMessage, type BushSlashMessage } from '#lib';
import assert from 'assert';
import {
	ActionRow,
	ApplicationCommandOptionType,
	AutocompleteInteraction,
	ButtonComponent,
	ButtonStyle,
	Embed,
	PermissionFlagsBits
} from 'discord.js';
import Fuse from 'fuse.js';
import packageDotJSON from '../../../package.json' assert { type: 'json' };

assert(Fuse);
assert(packageDotJSON);

export default class HelpCommand extends BushCommand {
	public constructor() {
		super('help', {
			aliases: ['help'],
			category: 'info',
			description: 'Displays a list of commands, or detailed information for a specific command.',
			usage: ['help [command]'],
			examples: ['help prefix'],
			args: [
				{
					id: 'command',
					description: 'The command to show info about.',
					type: 'commandAlias',
					match: 'content',
					prompt: 'What command do you need help with?',
					retry: '{error} Choose a valid command to find help for.',
					slashType: ApplicationCommandOptionType.String,
					optional: true,
					autocomplete: true
				},
				{
					id: 'showHidden',
					description: 'Whether ot not to show hidden commands as well.',
					match: 'flag',
					flag: '--hidden',
					slashType: ApplicationCommandOptionType.Boolean,
					ownerOnly: true,
					only: 'text',
					optional: true
				}
			],
			slash: true,
			clientPermissions: (m) => util.clientSendAndPermCheck(m, [PermissionFlagsBits.EmbedLinks], true),
			userPermissions: []
		});
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		args: { command: ArgType<'commandAlias'> | string; showHidden?: boolean }
	) {
		const prefix = util.prefix(message);
		const row = this.addLinks(message);

		const isOwner = client.isOwner(message.author);
		const isSuperUser = client.isSuperUser(message.author);
		const command = args.command
			? typeof args.command === 'string'
				? client.commandHandler.findCommand(args.command) ?? null
				: args.command
			: null;
		if (!isOwner) args.showHidden = false;
		if (!command || command.pseudo) {
			const embed = new Embed().setColor(util.colors.default).setTimestamp();
			embed.setFooter({ text: `For more information about a command use ${prefix}help <command>` });
			for (const [, category] of this.handler.categories) {
				const categoryFilter = category.filter((command) => {
					if (command.pseudo) return false;
					if (command.hidden && !args.showHidden) return false;
					if (command.channel == 'guild' && !message.guild && !args.showHidden) return false;
					if (command.ownerOnly && !isOwner) return false;
					if (command.superUserOnly && !isSuperUser) return false;
					if (command.restrictedGuilds?.includes(message.guild?.id ?? '') === false && !args.showHidden) return false;
					if (command.aliases.length === 0) return false;

					return true;
				});
				const categoryNice = category.id
					.replace(/(\b\w)/gi, (lc) => lc.toUpperCase())
					.replace(/'(S)/g, (letter) => letter.toLowerCase());
				const categoryCommands = categoryFilter.filter((cmd) => cmd.aliases.length > 0).map((cmd) => `\`${cmd.aliases[0]}\``);
				if (categoryCommands.length > 0) {
					embed.addField({ name: `${categoryNice}`, value: `${categoryCommands.join(' ')}` });
				}
			}
			return await message.util.reply({ embeds: [embed], components: row.components.length ? [row] : undefined });
		}

		const embed = new Embed()
			.setColor(util.colors.default)
			.setTitle(`${command.id} Command`)
			.setDescription(`${command.description ?? '*This command does not have a description.*'}`);
		if (command.usage?.length) {
			embed.addField({
				name: `» Usage${command.usage.length > 1 ? 's' : ''}`,
				value: command.usage.map((u) => `\`${u}\``).join('\n')
			});
		}
		if (command.examples?.length) {
			embed.addField({
				name: `» Example${command.examples.length > 1 ? 's' : ''}`,
				value: command.examples.map((u) => `\`${u}\``).join('\n')
			});
		}
		if (command.aliases?.length > 1) embed.addField({ name: '» Aliases', value: `\`${command.aliases.join('` `')}\`` });
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
			if (restrictions.length) embed.addField({ name: '» Restrictions', value: restrictions.join('\n') });
		}

		const params = { embeds: [embed], components: row.components.length ? [row] : undefined };
		return await message.util.reply(params);
	}

	private addLinks(message: BushMessage | BushSlashMessage) {
		const row = new ActionRow();

		if (!client.config.isDevelopment && !client.guilds.cache.some((guild) => guild.ownerId === message.author.id)) {
			// @ts-expect-error: outdated @discord.js/builders
			row.addComponents(new ButtonComponent().setStyle(ButtonStyle.Link).setLabel('Invite Me').setURL(util.invite));
		}
		if (!client.guilds.cache.get(client.config.supportGuild.id)?.members.cache.has(message.author.id)) {
			row.addComponents(
				// @ts-expect-error: outdated @discord.js/builders
				new ButtonComponent().setStyle(ButtonStyle.Link).setLabel('Support Server').setURL(client.config.supportGuild.invite)
			);
		}
		if (packageDotJSON?.repository)
			// @ts-expect-error: outdated @discord.js/builders
			row.addComponents(new ButtonComponent().setStyle(ButtonStyle.Link).setLabel('GitHub').setURL(packageDotJSON.repository));
		else void message.channel?.send('Error importing package.json, please report this to my developer.');

		return row;
	}

	public override autocomplete(interaction: AutocompleteInteraction) {
		const aliases = this.handler.modules.map((module) => module.aliases).flat();

		const fuzzy = new Fuse(aliases, {
			threshold: 0.5,
			isCaseSensitive: false,
			findAllMatches: true
		}).search(interaction.options.getFocused().toString());

		const res = fuzzy.slice(0, fuzzy.length >= 25 ? 25 : undefined).map((v) => ({ name: v.item, value: v.item }));

		const startingCommands = [
			...this.handler.modules.filter((command) => !command.ownerOnly && !command.hidden && !command.pseudo).keys()
		]
			.slice(0, 25)
			.map((v) => ({ name: v, value: v }));

		void interaction.respond(res.length ? res : startingCommands);
	}
}
