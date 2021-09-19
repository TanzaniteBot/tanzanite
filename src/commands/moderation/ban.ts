import { AllowedMentions, BushCommand, BushMessage, BushSlashMessage } from '@lib';
import { Snowflake, User } from 'discord.js';

export default class BanCommand extends BushCommand {
	public constructor() {
		super('ban', {
			aliases: ['ban', 'forceban', 'dban'],
			category: 'moderation',
			description: {
				content: 'Ban a member from the server.',
				usage: 'ban <member> <reason> [--delete ]',
				examples: ['ban ironm00n 1 day commands in #general --delete 7']
			},
			args: [
				{
					id: 'user',
					customType: util.arg.union('user', 'snowflake'),
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

	public override async exec(
		message: BushMessage | BushSlashMessage,
		{
			user: _user,
			reason,
			days,
			force
		}: {
			user: User | Snowflake;
			reason?: { duration: number | null; contentWithoutTime: string };
			days?: number;
			force: boolean;
		}
	): Promise<unknown> {
		if (reason?.duration === null) reason.duration = 0;

		if (!message.guild) return message.util.reply(`${util.emojis.error} This command cannot be used in dms.`);
		const member = message.guild!.members.cache.get((_user as User)?.id);
		const user = member?.user ?? (await util.resolveNonCachedUser(_user));
		if (!user) return message.util.reply(`${util.emojis.error} Invalid user.`);
		const useForce = force && message.author.isOwner();
		if (!message.member) throw new Error(`message.member is null`);

		const canModerateResponse = member
			? await util.moderationPermissionCheck(message.member, member, 'ban', true, useForce)
			: true;

		if (canModerateResponse !== true) {
			return await message.util.reply(canModerateResponse);
		}

		if (message.util.parsed?.alias === 'dban' && !days) days = 1;

		if (!Number.isInteger(days) || days! < 0 || days! > 7) {
			return message.util.reply(`${util.emojis.error} The delete days must be an integer between 0 and 7.`);
		}

		let time: number;
		if (reason) {
			time =
				typeof reason === 'string'
					? await util.arg.cast('duration', client.commandHandler.resolver, message as BushMessage, reason)
					: reason.duration;
		}
		const parsedReason = reason?.contentWithoutTime ?? null;

		const responseCode = member
			? await member.bushBan({
					reason: parsedReason,
					moderator: message.member,
					duration: time! ?? 0,
					deleteDays: days ?? 0
			  })
			: await message.guild.bushBan({
					user,
					reason: parsedReason,
					moderator: message.member,
					duration: time! ?? 0,
					deleteDays: days ?? 0
			  });

		const responseMessage = () => {
			switch (responseCode) {
				case 'missing permissions':
					return `${util.emojis.error} Could not ban **${user.tag}** because I do not have permissions`;
				case 'error banning':
					return `${util.emojis.error} An error occurred while trying to ban **${user.tag}**.`;
				case 'error creating ban entry':
					return `${util.emojis.error} While banning **${user.tag}**, there was an error creating a ban entry, please report this to my developers.`;
				case 'error creating modlog entry':
					return `${util.emojis.error} While banning **${user.tag}**, there was an error creating a modlog entry, please report this to my developers.`;
				case 'failed to dm':
					return `${util.emojis.warn} Banned **${user.tag}** however I could not send them a dm.`;
				case 'success':
					return `${util.emojis.success} Successfully banned **${user.tag}**.`;
			}
		};
		return await message.util.reply({ content: responseMessage(), allowedMentions: AllowedMentions.none() });
	}
}
