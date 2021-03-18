import { BushCommand } from '../../lib/extensions/BushCommand';
import { Message, GuildChannel, PermissionOverwrites, Role } from 'discord.js';
import AllowedMentions from '../../lib/utils/AllowedMentions';

export default class FixMuteCommand extends BushCommand {
	public constructor() {
		super('FixMute', {
			aliases: ['FixMute', 'MuteFix'],
			category: 'Server Admin',
			description: {
				content: "Tells you all the channels that mute doesn't work in.",
				usage: 'FixMute',
				examples: ['FixMute']
			},
			channel: 'guild',
			ownerOnly: true,
			clientPermissions: ['MANAGE_CHANNELS', 'SEND_MESSAGES'],
			userPermissions: ['KICK_MEMBERS'],
			typing: true
		});
	}
	//I haven't tested this yet so idk if it works.
	public async exec(message: Message): Promise<void> {
		// let mutedRole;
		if (message.guild.id == '516977525906341928') {
			//moulberry's bush
			// mutedRole = '748912426581229690';
		} else if (message.guild.id == '784597260465995796') {
			//MB Staff (for testing)
			// mutedRole = '804173466726825994';
		} else return;
		const brokenChannels = [];
		const brokenRoles = [];
		for (const channel of message.guild.channels.cache.array()) {
			for (const role of message.guild.roles.cache.array()) {
				try {
					const overwrites = channel.permissionOverwrites.get(role.id) || new PermissionOverwrites(channel);
					if (role.id != '788958020985815071') {
						if (overwrites.allow.has('SEND_MESSAGES')) {
							brokenChannels.push(channel);
							brokenRoles.push(channel);
						}
					}
				} catch (e) {
					//
				}
			}
		}
		if ((!Array.isArray(brokenChannels) || !brokenChannels.length) && (!Array.isArray(brokenRoles) || !brokenRoles.length)) {
			//checks if there is anything in the arrays, ty stack overflow
			await message.util.reply('No roles seem to be overriding the mute role.');
		} else {
			await message.util.reply(`The following overrides are breaking the mute role:\n${brokenRoles.map((x: Role) => `<@&${x.id}>, `).join(' ')} \n${brokenChannels.map((y: GuildChannel) => `<#${y.id}>, `).join(' ')}`, {
				//ik there is a better way to do this but I need to go to bed and I want to make a commit
				allowedMentions: AllowedMentions.none()
			});
			//console.log(brokenChannels.map.name)
		}
	}
}
