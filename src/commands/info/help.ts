import {
	AllIntegrationTypes,
	AllInteractionContexts,
	BotCommand,
	colors,
	format,
	formatPerms,
	invite,
	permissionCheck,
	type ArgType,
	type CommandMessage,
	type OptArgType,
	type SlashMessage
} from '#lib';
import { stripIndent } from '#tags';
import {
	ActionRowBuilder,
	ApplicationCommandOptionType,
	AutocompleteInteraction,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder
} from 'discord.js';
import Fuse from 'fuse.js';
import assert from 'node:assert/strict';
import packageDotJSON from '../../../package.json' with { type: 'json' };

assert(Fuse != null);
assert(packageDotJSON != null);

export default class HelpCommand extends BotCommand {
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
			clientPermissions: ['EmbedLinks'],
			clientCheckChannel: true,
			userPermissions: [],
			slashContexts: AllInteractionContexts,
			slashIntegrationTypes: AllIntegrationTypes
		});
	}

	public override async exec(message: CommandMessage | SlashMessage, args: HelpArgs) {
		const row = this.addLinks(message);
		const command =
			(typeof args?.command === 'string' ? this.client.commandHandler.findCommand(args.command) : args?.command) ?? null;

		if (!message.author.isOwner()) args.showHidden = false;

		if (!command || command.pseudo) {
			return this.helpAll(message, args, row);
		} else {
			return this.helpIndividual(message, row, command);
		}
	}

	private helpAll(message: CommandMessage | SlashMessage, args: HelpArgs, row: ActionRowBuilder<ButtonBuilder>) {
		const prefix_ = this.client.utils.prefix(message);
		const embed = new EmbedBuilder()
			.setColor(colors.default)
			.setTimestamp()
			.setFooter({ text: `For more information about a command use ${prefix_}help <command>` });
		for (const [, category] of this.handler.categories.sort((a, b) => a.id.localeCompare(b.id))) {
			const categoryFilter = category.filter((command) => {
				const inGuild = message.inGuild();

				if (command.pseudo) return false;
				if (command.hidden && !args.showHidden) return false;
				if (command.channel === 'guild' && !inGuild && !args.showHidden) return false;
				if (command.ownerOnly && !message.author.isOwner()) return false;
				if (command.superUserOnly && !message.author.isSuperUser()) return false;
				if (command.restrictedGuilds?.includes(message.guild?.id ?? '') === false && !args.showHidden) return false;
				if (command.aliases.length === 0) return false;

				permissions: {
					if (!inGuild || message.member == null) break permissions;

					const canUse = permissionCheck(message, message.member, command.userPermissions, false);

					if (!canUse) return false;
				}

				return true;
			});
			const categoryNice = category.id
				.replace(/(\b\w)/gi, (lc) => lc.toUpperCase())
				.replace(/'(S)/g, (letter) => letter.toLowerCase());
			const categoryCommands = categoryFilter.filter((cmd) => cmd.aliases.length > 0).map((cmd) => `\`${cmd.aliases[0]}\``);
			if (categoryCommands.length > 0) {
				embed.addFields({ name: `${categoryNice}`, value: `${categoryCommands.join(' ')}` });
			}
		}
		return message.util.reply({ embeds: [embed], components: row.components.length ? [row] : undefined });
	}

	private helpIndividual(message: CommandMessage | SlashMessage, row: ActionRowBuilder<ButtonBuilder>, command: BotCommand) {
		const embed = new EmbedBuilder().setColor(colors.default).setTitle(`${command.id} Command`);

		let description = `${command.description ?? '*This command does not have a description.*'}`;
		if (command.note ?? '') description += `\n\n${command.note}`;
		embed.setDescription(description);

		this.addCommandUsage(embed, command);
		this.addCommandExamples(embed, command);
		this.addCommandAliases(embed, command);
		this.addCommandArguments(embed, command, message.author.isOwner(), message.author.isSuperUser());
		this.addCommandRestrictions(embed, command);
		this.addCommandPermissions(embed, command);

		const params = { embeds: [embed], components: row.components.length ? [row] : undefined };
		return message.util.reply(params);
	}

	private addCommandUsage(embed: EmbedBuilder, command: BotCommand): void {
		if (command.usage?.length) {
			embed.addFields({
				name: `» Usage${command.usage.length > 1 ? 's' : ''}`,
				value: command.usage.map((u) => `\`${u}\``).join('\n')
			});
		}
	}

	private addCommandExamples(embed: EmbedBuilder, command: BotCommand): void {
		if (command.examples?.length) {
			embed.addFields({
				name: `» Example${command.examples.length > 1 ? 's' : ''}`,
				value: command.examples.map((u) => `\`${u}\``).join('\n')
			});
		}
	}

	private addCommandAliases(embed: EmbedBuilder, command: BotCommand): void {
		if (command.aliases?.length > 1)
			embed.addFields({
				name: '» Aliases',
				value: `\`${command.aliases.join('` `')}\``
			});
	}

	private addCommandArguments(embed: EmbedBuilder, command: BotCommand, isOwner = false, isSuperUser = false): void {
		const format = (id: string, req: boolean) => `${req ? '<' : '['}${id}${req ? '>' : ']'}`;
		const args = (command.argsInfo ?? []).filter((arg) => {
			if (arg.ownerOnly === true && !isOwner) return false;
			if (arg.superUserOnly === true && !isSuperUser) return false;
			return true;
		});
		if (args.length) {
			embed.addFields({
				name: '» Arguments',
				value: args
					.map((a) => {
						let ret = stripIndent`
							\`${format(a.name, a.optional !== true)}\`
							⠀‣ **Desc**: ${a.description}
							⠀‣ **Type**: ${typeof a.type !== 'function' ? a.type : '[no readable type]'}`;

						if (a.flag?.length ?? 0) ret += `\n⠀‣ **Flags**: ${a.flag!.map((f) => `"${f}"`).join(', ')}`;
						ret += `\n⠀‣ **Kind**: ${a.only ?? 'text & slash'}`;
						if (a.only !== 'slash') ret += `\n⠀‣ **Match**: ${a.match}`;
						if (a.only !== 'text') ret += `\n⠀‣ **Autocomplete**: ${a.autocomplete}`;

						return ret;
					})
					.join('\n')
					.slice(0, 1024)
			});
		}
	}

	private addCommandRestrictions(embed: EmbedBuilder, command: BotCommand): void {
		if (
			command.ownerOnly ||
			command.superUserOnly ||
			command.hidden ||
			command.channel != null ||
			(command.restrictedChannels?.length ?? 0) ||
			(command.restrictedGuilds?.length ?? 0)
		) {
			const restrictions: string[] = [];
			if (command.ownerOnly) restrictions.push('__Developer Only__');
			if (command.ownerOnly) restrictions.push('__Super User Only__');
			if (command.hidden) restrictions.push('__Hidden__');
			if (command.channel === 'dm') restrictions.push('__DM Only__');
			if (command.channel === 'guild') restrictions.push('__Server Only__');
			if (command.restrictedChannels?.length ?? 0)
				restrictions.push(`__Restricted Channels__: ${command.restrictedChannels!.map((c) => `<#${c}>`).join(' ')}`);
			if (command.restrictedGuilds?.length ?? 0)
				restrictions.push(
					`__Restricted Servers__: ${command
						.restrictedGuilds!.map((g) =>
							format.inlineCode(this.client.guilds.cache.find((g1) => g1.id === g)?.name ?? 'Unknown')
						)
						.join(' ')}`
				);
			if (restrictions.length) embed.addFields({ name: '» Restrictions', value: restrictions.join('\n') });
		}
	}

	private addCommandPermissions(embed: EmbedBuilder, command: BotCommand): void {
		if (command.userPermissions.length < 1 && command.clientPermissions.length < 1) return;
		const permissions: string[] = [];
		if (command.userPermissions.length > 0) permissions.push(`__User__: ${formatPerms(command.userPermissions)}`);
		if (command.clientPermissions.length > 0) permissions.push(`__Client__: ${formatPerms(command.clientPermissions)}`);
		embed.addFields({ name: '» Required Permissions', value: permissions.join('\n') });
	}

	private addLinks(message: CommandMessage | SlashMessage): ActionRowBuilder<ButtonBuilder> {
		const row = new ActionRowBuilder<ButtonBuilder>();
		const config = this.client.config;

		if (!config.isDevelopment || message.author.isOwner()) {
			row.addComponents(new ButtonBuilder({ style: ButtonStyle.Link, label: 'Invite Me', url: invite(this.client) }));
		}
		if (config.supportGuild.id != null && config.supportGuild.invite != null) {
			row.addComponents(new ButtonBuilder({ style: ButtonStyle.Link, label: 'Support Server', url: config.supportGuild.invite }));
		}
		if (packageDotJSON?.repository)
			row.addComponents(new ButtonBuilder({ style: ButtonStyle.Link, label: 'GitHub', url: packageDotJSON.repository }));
		else throw new Error('Error importing package.json.');

		row.addComponents(
			new ButtonBuilder({ style: ButtonStyle.Link, label: 'Privacy Policy', url: 'https://privacy.tanzanite.dev' })
		);

		return row;
	}

	public override autocomplete(interaction: AutocompleteInteraction): void {
		const aliases = this.handler.modules.map((module) => module.aliases).flat();

		const fuzzy = new Fuse(aliases, {
			threshold: 0.5,
			isCaseSensitive: false,
			findAllMatches: true
		}).search(interaction.options.getFocused().value);

		const res = fuzzy.slice(0, 25).map((v) => ({ name: v.item, value: v.item }));

		const startingCommands = [
			...this.handler.modules.filter((command) => !command.ownerOnly && !command.hidden && !command.pseudo).keys()
		]
			.slice(0, 25)
			.map((v) => ({ name: v, value: v }));

		void interaction.respond(res.length ? res : startingCommands);
	}
}

type HelpArgs = { command: OptArgType<'commandAlias'> | string; showHidden: ArgType<'flag'> };
