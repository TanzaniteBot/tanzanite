import { PermissionOverwrites, GuildChannel, Role, GuildMember, Message } from 'discord.js';
import { BotCommand } from '../../extensions/BotCommand';
import { Argument } from 'discord-akairo';

export default class ChannelPermsCommand extends BotCommand {
	public constructor() {
		super('ChannelPerms', {
			aliases: ['ChannelPerms', 'cperms', 'cperm', 'chanperms', 'chanperm'],
			category: 'owner',
			description: {
				content: 'Use to mass change the channel ',
				usage: 'ChannelPerms <role_id> <perm> <state>',
				examples: ['ChannelPerms 783794633129197589 read_messages deny'],
			},
			args: [
				{
					id: 'target',
					type: Argument.union('role', 'member'),
					prompt: {
						start: 'What user/role would you like to change?',
						retry: 'Invalid response. What user/role would you like to change?',
					},
				},
				{
					id: 'permission',
					type: 'permission', // I just made this a custom type
					prompt: {
						start: 'What permission would you like to change?',
						retry: 'Invalid response. What permission would you like to change?',
					},
				},
				{
					id: 'state',
					type: [
						['true', '1', 'yes', 'enable', 'allow'],
						['false', '0', 'no', 'disable', 'disallow'],
						['neutral', 'remove', 'none'],
					],
					prompt: {
						start: 'What should that permission be set to?',
						retry: 'Invalid response. What should that permission be set to?',
					},
				},
			],
			ratelimit: 4,
			cooldown: 4000,
			ownerOnly: true,
			clientPermissions: ['MANAGE_CHANNELS'],
			userPermissions: ['MANAGE_CHANNELS', 'MANAGE_GUILD', 'MANAGE_ROLES'],
			channel: 'guild',
		});
	}
	public async exec(
		message: Message,
		{
			target,
			permission,
			state,
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
			} catch /*(e)*/ {
				//console.log(e.stack);
				failedChannels.push(channel);
			}
		}
		await message.util.send(`Finished changing perms! Failed channels:\n${failedChannels.map((e: GuildChannel) => `<#${e.id}>`).join(' ')}`);
	}
}
