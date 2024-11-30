import {
	AllowedMentions,
	Arg,
	BotCommand,
	addOrRemoveFromArray,
	emojis,
	type ArgType,
	type CommandMessage,
	type SlashMessage
} from '#lib';
import { input } from '#lib/utils/Format.js';
import { ApplicationCommandOptionType, AutocompleteInteraction } from 'discord.js';
import assert from 'node:assert/strict';

// todo: remove this bullshit once typescript gets its shit together
const Fuse = (await import('fuse.js')).default as unknown as typeof import('fuse.js').default;

export default class DisableCommand extends BotCommand {
	private static blacklistedCommands = ['eval', 'disable'];

	public constructor() {
		super('disable', {
			aliases: ['disable', 'enable'],
			category: 'config',
			description: 'A command to disable and enable commands.',
			usage: ['disable|enable <command>'],
			examples: ['enable ban', 'disable kick'],
			args: [
				{
					id: 'action',
					description: 'Whether to disable or enable the command.',
					readableType: "'disable'|'enable'",
					prompt: 'Would you like to disable or enable a command?',
					slashType: ApplicationCommandOptionType.String,
					choices: ['disable', 'enable'].map((v) => ({ name: v, value: v })),
					only: 'slash'
				},
				{
					id: 'command',
					description: 'The command to disable/enable.',
					type: Arg.union('commandAlias', 'command'),
					readableType: 'command|commandAlias',
					prompt: 'What command would you like to enable/disable?',
					retry: '{error} Pick a valid command.',
					slashType: ApplicationCommandOptionType.String,
					autocomplete: true
				},
				{
					id: 'global',
					description: 'Disable the command globally.',
					match: 'flag',
					flag: '--global',
					optional: true,
					slashType: false,
					only: 'text',
					ownerOnly: true
				}
			],
			slash: true,
			channel: 'guild',
			clientPermissions: [],
			userPermissions: ['ManageGuild']
		});
	}

	public override async exec(
		message: CommandMessage | SlashMessage,
		args: { action?: 'enable' | 'disable'; command: ArgType<'commandAlias'> | string; global: ArgType<'flag'> }
	) {
		assert(message.inGuild());

		let action = (args.action ?? message.util?.parsed?.alias ?? 'toggle') as 'disable' | 'enable' | 'toggle';
		const global = args.global && message.author.isOwner();
		const commandID =
			args.command instanceof BotCommand ? args.command.id : (await Arg.cast('commandAlias', message, args.command))?.id;

		if (!commandID) return await message.util.reply(`${emojis.error} Invalid command.`);

		if (DisableCommand.blacklistedCommands.includes(commandID))
			return message.util.send(`${emojis.error} the ${commandID} command cannot be disabled.`);

		const disabledCommands = global
			? this.client.utils.getGlobal('disabledCommands')
			: await message.guild.getSetting('disabledCommands');

		if (action === 'toggle') action = disabledCommands.includes(commandID) ? 'disable' : 'enable';
		const newValue = addOrRemoveFromArray(action === 'disable' ? 'add' : 'remove', disabledCommands, commandID);
		const success = global
			? await this.client.utils.setGlobal('disabledCommands', newValue).catch(() => false)
			: await message.guild.setSetting('disabledCommands', newValue, message.member!).catch(() => false);

		const actionStem = action.substring(0, action.length - 2);

		if (!success) {
			return await message.util.reply({
				content: `${emojis.error} There was an error${global ? ' globally' : ''} **${actionStem}ing** the ${input(
					commandID
				)} command.`,
				allowedMentions: AllowedMentions.none()
			});
		} else {
			return await message.util.reply({
				content: `${emojis.success} Successfully **${actionStem}ed** the ${input(commandID)} command${
					global ? ' globally' : ''
				}.`,
				allowedMentions: AllowedMentions.none()
			});
		}
	}

	public override async autocomplete(interaction: AutocompleteInteraction) {
		const commands = [...this.handler.modules.keys()];

		const fuzzy = new Fuse(commands, {
			threshold: 0.5,
			isCaseSensitive: false,
			findAllMatches: true
		}).search(interaction.options.getFocused().value);

		const res = fuzzy.slice(0, 25).map((v) => ({ name: v.item, value: v.item }));

		void interaction.respond(res);
	}
}
