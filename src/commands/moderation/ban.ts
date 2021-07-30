import { AllowedMentions, BushCommand, BushGuildMember, BushMessage, BushSlashMessage } from '@lib';
import { Argument } from 'discord-akairo';
import { User } from 'discord.js';

export default class BanCommand extends BushCommand {
	public constructor() {
		super('ban', {
			aliases: ['ban', 'forceban'],
			category: 'moderation',
			description: {
				content: 'Ban a member from the server.',
				usage: 'ban <member> <reason> [--delete ]',
				examples: ['ban ironm00n 1 day commands in #general --delete 7']
			},
			args: [
				{
					id: 'user',
					type: 'user',
					prompt: {
						start: 'What user would you like to ban?',
						retry: '{error} Choose a valid user to ban.'
					}
				},
				{
					id: 'reason',
					type: 'contentWithDuration',
					match: 'restContent',
					prompt: {
						start: 'Why should this user be banned and for how long?',
						retry: '{error} Choose a valid ban reason and duration.',
						optional: true
					}
				},
				{
					id: 'days',
					flag: '--days',
					match: 'option',
					customType: util.arg.range('integer', 0, 7, true),
					default: 0
				},
				{
					id: 'force',
					flag: '--force',
					match: 'flag'
				}
			],
			slash: true,
			slashOptions: [
				{
					name: 'user',
					description: 'What user would you like to ban?',
					type: 'USER',
					required: true
				},
				{
					name: 'reason',
					description: 'Why should this user be banned and for how long?',
					type: 'STRING',
					required: false
				},
				{
					name: 'days',
					description: "How many days of the user's messages would you like to delete?",
					type: 'INTEGER',
					required: false,
					choices: [
						{ name: '0', value: 0 },
						{ name: '1', value: 1 },
						{ name: '2', value: 2 },
						{ name: '3', value: 3 },
						{ name: '4', value: 4 },
						{ name: '5', value: 5 },
						{ name: '6', value: 6 },
						{ name: '7', value: 7 }
					]
				}
			],
			channel: 'guild',
			clientPermissions: ['BAN_MEMBERS'],
			userPermissions: ['BAN_MEMBERS']
		});
	}
	async exec(
		message: BushMessage | BushSlashMessage,
		{
			user,
			reason,
			days,
			force
		}: { user: User; reason?: { duration: number; contentWithoutTime: string }; days?: number; force: boolean }
	): Promise<unknown> {
		const member = message.guild.members.cache.get(user.id) as BushGuildMember;
		const useForce = force && message.author.isOwner();
		const canModerateResponse = util.moderationPermissionCheck(message.member, member, 'ban', true, useForce);

		if (canModerateResponse !== true) {
			return message.util.reply(canModerateResponse);
		}

		if (!Number.isInteger(days) || days < 0 || days > 7) {
			return message.util.reply(`${util.emojis.error} The delete days must be an integer between 0 and 7.`);
		}

		let time: number;
		if (reason) {
			time =
				typeof reason === 'string'
					? await Argument.cast('duration', client.commandHandler.resolver, message as BushMessage, reason)
					: reason.duration;
		}
		const parsedReason = reason.contentWithoutTime;

		const responseCode = await member.bushBan({
			reason: parsedReason,
			moderator: message.author,
			duration: time,
			deleteDays: days ?? 0
		});

		const responseMessage = () => {
			switch (responseCode) {
				case 'missing permissions':
					return `${util.emojis.error} Could not ban **${member.user.tag}** because I do not have permissions`;
				case 'error banning':
					return `${util.emojis.error} An error occurred while trying to ban **${member.user.tag}**.`;
				case 'error creating ban entry':
					return `${util.emojis.error} While banning **${member.user.tag}**, there was an error creating a ban entry, please report this to my developers.`;
				case 'error creating modlog entry':
					return `${util.emojis.error} While banning **${member.user.tag}**, there was an error creating a modlog entry, please report this to my developers.`;
				case 'failed to dm':
					return `${util.emojis.warn} Banned **${member.user.tag}** however I could not send them a dm.`;
				case 'success':
					return `${util.emojis.success} Successfully banned **${member.user.tag}**.`;
			}
		};
		return await message.util.reply({ content: responseMessage(), allowedMentions: AllowedMentions.none() });
	}
}
