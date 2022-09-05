import {
	Arg,
	BotCommand,
	ButtonPaginator,
	emojis,
	formatError,
	type ArgType,
	type CommandMessage,
	type SlashMessage
} from '#lib';
import assert from 'assert/strict';
import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';

export default class ChannelPermissionsCommand extends BotCommand {
	public constructor() {
		super('channelPermissions', {
			aliases: ['channel-perms', 'cperms', 'cperm', 'chanperms', 'chanperm', 'channel-permissions'],
			category: 'admin',
			typing: true,
			description: 'Use to mass change the channel permissions.',
			usage: ['channel-perms <role_id> <perm> <state>'],
			examples: ['channel-perms 783794633129197589 read_messages deny'],
			args: [
				{
					id: 'target',
					description: 'The user/role to change the permissions of.',
					type: Arg.union('member', 'role'),
					readableType: 'member|role',
					prompt: 'What user/role would you like to change?',
					retry: '{error} Choose a valid user/role to change.',
					slashType: ApplicationCommandOptionType.Mentionable
				},
				{
					id: 'permission',
					description: 'The permission to change for the target user/role.',
					type: 'permission',
					prompt: 'What permission would you like to change?',
					retry: '{error} Choose a valid permission.',
					slashType: ApplicationCommandOptionType.String
				},
				{
					id: 'state',
					description: 'The state that the permission should be set to for the target.',
					customType: [
						['true', '1', 'yes', 'enable', 'allow'],
						['false', '0', 'no', 'disable', 'disallow', 'deny'],
						['neutral', 'remove', 'none']
					],
					readableType: "'enable'|'disable'|'remove'",
					prompt: 'What should that permission be set to?',
					retry: '{error} Set the state to either `enable`, `disable`, or `remove`.',
					slashType: ApplicationCommandOptionType.String,
					choices: [
						{ name: 'Enabled', value: 'true' },
						{ name: 'Disabled', value: 'false' },
						{ name: 'Neutral', value: 'neutral' }
					]
				}
			],
			clientPermissions: ['ManageChannels'],
			userPermissions: ['Administrator'],
			channel: 'guild',
			slash: true,
			lock: 'guild'
		});
	}

	public override async exec(
		message: CommandMessage | SlashMessage,
		args: { target: ArgType<'member' | 'role'>; permission: ArgType<'permission'>; state: 'true' | 'false' | 'neutral' }
	) {
		assert(message.inGuild());
		if (message.util.isSlashMessage(message)) await message.interaction.deferReply();

		const permission = message.util.isSlashMessage(message)
			? await Arg.cast('permission', message, args.permission)
			: args.permission;
		if (!permission) return await message.util.reply(`${emojis.error} Invalid permission.`);
		const failedChannels = [];
		for (const [, channel] of message.guild.channels.cache) {
			try {
				if (channel.isThread()) return;
				if (channel.permissionsLocked) return;
				const permissionState = args.state === 'true' ? true : args.state === 'false' ? false : null;
				await channel.permissionOverwrites.create(
					args.target.id,
					{ [permission]: permissionState },
					{ reason: 'Changing overwrites for mass channel perms command' }
				);
			} catch (e) {
				void this.client.console.error('channelPermissions', formatError(e, false));
				failedChannels.push(channel);
			}
		}
		const failure = failedChannels.map((c) => `<#${c.id}>`).join(' ');
		if (failure.length > 2000) {
			const paginate: EmbedBuilder[] = [];
			for (let i = 0; i < failure.length; i += 4000) {
				paginate.push(new EmbedBuilder().setDescription(failure.substring(i, Math.min(failure.length, i + 4000))));
			}
			const normalMessage = `Finished changing perms! Failed channels:`;
			return await ButtonPaginator.send(message, paginate, normalMessage);
		} else {
			return await message.util.reply({
				content: `Finished changing perms! Failed channels:`,
				embeds: [{ description: failure }]
			});
		}
	}
}
