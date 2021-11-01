import { BushCommand, ButtonPaginator, type BushMessage, type BushSlashMessage } from '@lib';
import { MessageEmbed, type GuildMember, type PermissionString, type Role } from 'discord.js';

export default class ChannelPermissionsCommand extends BushCommand {
	public constructor() {
		super('channelPermissions', {
			aliases: ['channel-perms', 'cperms', 'cperm', 'chanperms', 'chanperm', 'channel-permissions'],
			category: 'admin',
			typing: true,
			description: {
				content: 'Use to mass change the channel permissions.',
				usage: ['channel-perms <role_id> <perm> <state>'],
				examples: ['channel-perms 783794633129197589 read_messages deny']
			},
			args: [
				{
					id: 'target',
					customType: util.arg.union('member', 'member'),
					prompt: {
						start: 'What user/role would you like to change?',
						retry: '{error} Choose a valid user/role to change.'
					}
				},
				{
					id: 'permission',
					type: 'permission',
					prompt: {
						start: 'What permission would you like to change?',
						retry: '{error} Choose a valid permission.'
					}
				},
				{
					id: 'state',
					customType: [
						['true', '1', 'yes', 'enable', 'allow'],
						['false', '0', 'no', 'disable', 'disallow', 'deny'],
						['neutral', 'remove', 'none']
					],
					prompt: {
						start: 'What should that permission be set to?',
						retry: '{error} Set the state to either `enable`, `disable`, or `remove`.'
					}
				}
			],
			clientPermissions: (m) => util.clientSendAndPermCheck(m, ['MANAGE_CHANNELS']),
			userPermissions: ['ADMINISTRATOR'],
			channel: 'guild',
			slash: true,
			slashOptions: [
				{
					name: 'target',
					description: 'What user/role would you like to change?',
					type: 'MENTIONABLE',
					required: true
				},
				{
					name: 'permission',
					description: 'What permission would you like to change?',
					type: 'STRING',
					required: true
				},
				{
					name: 'state',
					description: 'What should that permission be set to?',
					type: 'STRING',
					choices: [
						{
							name: 'Enabled',
							value: 'true'
						},
						{
							name: 'Disabled',
							value: 'false'
						},
						{
							name: 'Neutral',
							value: 'neutral'
						}
					],
					required: true
				}
			]
		});
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		args: {
			target: Role | GuildMember;
			permission: PermissionString | string;
			state: 'true' | 'false' | 'neutral';
		}
	) {
		if (!message.guild) return await message.util.reply(`${util.emojis.error} This command can only be run in a server.`);
		if (!message.member!.permissions.has('ADMINISTRATOR') && !message.member!.user.isOwner())
			return await message.util.reply(`${util.emojis.error} You must have admin perms to use this command.`);
		if (message.util.isSlashMessage(message)) await message.interaction.deferReply();

		const permission: PermissionString = message.util.isSlashMessage(message)
			? await util.arg.cast('permission', message, args.permission)
			: args.permission;
		if (!permission) return await message.util.reply(`${util.emojis.error} Invalid permission.`);
		const failedChannels = [];
		for (const [, channel] of message.guild!.channels.cache) {
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
				void client.console.error('channelPermissions', e.stack);
				failedChannels.push(channel);
			}
		}
		const failure = failedChannels.map((c) => `<#${c.id}>`).join(' ');
		if (failure.length > 2000) {
			const paginate: MessageEmbed[] = [];
			for (let i = 0; i < failure.length; i += 4000) {
				paginate.push(new MessageEmbed().setDescription(failure.substring(i, Math.min(failure.length, i + 4000))));
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
