import { PermissionOverwrites, GuildChannel, Role, GuildMember, Message } from 'discord.js';
import { BushCommand, PermissionLevel } from '../../lib/extensions/BushCommand';
import { Argument } from 'discord-akairo';
import { MessageEmbed } from 'discord.js';
import functions from '../../constants/functions';

export default class ChannelPermsCommand extends BushCommand {
	public constructor() {
		super('ChannelPerms', {
			aliases: ['ChannelPerms', 'cperms', 'cperm', 'chanperms', 'chanperm'],
			category: 'Server Admin',
			typing: true,
			description: {
				content: 'Use to mass change the channel ',
				usage: 'ChannelPerms <role_id> <perm> <state>',
				examples: ['ChannelPerms 783794633129197589 read_messages deny']
			},
			args: [
				{
					id: 'target',
					type: Argument.union('role', 'member'),
					prompt: {
						start: 'What user/role would you like to change?',
						retry: 'Invalid response. What user/role would you like to change?'
					}
				},
				{
					id: 'permission',
					type: 'permission', // I just made this a custom type
					prompt: {
						start: 'What permission would you like to change?',
						retry: '<:no:787549684196704257> Choose a valid permission.'
					}
				},
				{
					id: 'state',
					type: [
						['true', '1', 'yes', 'enable', 'allow'],
						['false', '0', 'no', 'disable', 'disallow', 'deny'],
						['neutral', 'remove', 'none']
					],
					prompt: {
						start: 'What should that permission be set to?',
						retry: '<:no:787549684196704257> Set the state to either `enable`, `disable`, or `remove`.'
					}
				}
			],
			ratelimit: 4,
			cooldown: 4000,
			permissionLevel: PermissionLevel.Owner,
			clientPermissions: ['MANAGE_CHANNELS', 'SEND_MESSAGES'],
			userPermissions: ['MANAGE_CHANNELS', 'MANAGE_GUILD', 'MANAGE_ROLES'],
			channel: 'guild'
		});
	}
	public async exec(
		message: Message,
		{
			target,
			permission,
			state
		}: {
			target: Role | GuildMember;
			permission: string;
			state: 'true' | 'false' | 'neutral';
		}
	): Promise<void> {
		const failedChannels = [];
		for (const channel of message.guild.channels.cache.array()) {
			try {
				const overwrites = channel.permissionOverwrites.get(target.id) || new PermissionOverwrites(channel);
				const updateObject = {};
				if (state == 'true') updateObject[permission] = true;
				else if (state == 'false') updateObject[permission] = false;
				else if (state == 'neutral') updateObject[permission] = null;
				await overwrites.update(updateObject, 'Changing overwrites for mass channel channel perms command');
			} catch {
				failedChannels.push(channel);
			}
		}
		const failure = failedChannels.map((e: GuildChannel) => `<#${e.id}>`).join(' ');
		if (failure.length > 2000) {
			const paginate: MessageEmbed[] = [];
			for (let i = 0; i < failure.length; i += 2000) {
				paginate.push(new MessageEmbed().setDescription(failure.substring(i, Math.min(failure.length, i + 2000))));
			}
			const normalMessage = `Finished changing perms! Failed channels:`;
			functions.paginate(message, paginate, normalMessage);
		} else {
			await message.util.reply(`Finished changing perms! Failed channels:`, { embed: new MessageEmbed().setDescription(failure) });
		}
	}
}
