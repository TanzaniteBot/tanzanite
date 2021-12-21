import { AllowedMentions, BushCommand, Moderation, type BushMessage, type BushSlashMessage } from '#lib';
import { type Snowflake, type User } from 'discord.js';

export default class BanCommand extends BushCommand {
	public constructor() {
		super('ban', {
			aliases: ['ban', 'force-ban', 'dban'],
			category: 'moderation',
			description: 'Ban a member from the server.',
			usage: ['ban <member> <reason> [--delete]'],
			examples: ['ban ironm00n 1 day commands in #general --delete 7'],
			args: [
				{
					id: 'user',
					description: 'The user that will be banned.',
					type: util.arg.union('user', 'snowflake'),
					prompt: 'What user would you like to ban?',
					retry: '{error} Choose a valid user to ban.',
					slashType: 'USER'
				},
				{
					id: 'reason',
					description: 'The reason and duration of the ban.',
					type: 'contentWithDuration',
					match: 'restContent',
					prompt: 'Why should this user be banned and for how long?',
					retry: '{error} Choose a valid ban reason and duration.',
					slashType: 'STRING',
					optional: true
				},
				{
					id: 'days',
					description: 'The number of days of messages to delete when the user is banned, defaults to 0.',
					flag: '--days',
					match: 'option',
					prompt: "How many days of the user's messages would you like to delete?",
					retry: '{error} Choose between 0 and 7 days to delete messages from the user for.',
					type: util.arg.range('integer', 0, 7, true),
					optional: true,
					slashType: 'INTEGER',
					choices: [...Array(8).keys()].map((v) => ({ name: v.toString(), value: v }))
				},
				{
					id: 'force',
					description: 'Override permission checks.',
					flag: '--force',
					match: 'flag',
					optional: true,
					slashType: false,
					only: 'text',
					ownerOnly: true
				}
			],
			slash: true,
			channel: 'guild',
			clientPermissions: ['BAN_MEMBERS'],
			userPermissions: ['BAN_MEMBERS']
		});
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		args: {
			user: User | Snowflake;
			reason: { duration: number | null; contentWithoutTime: string } | null;
			days: number | null;
			force: boolean;
		}
	) {
		if (args.reason && typeof args.reason === 'object') args.reason.duration ??= 0;
		args.days ??= 0;

		if (!message.guild) return message.util.reply(`${util.emojis.error} This command cannot be used in dms.`);
		const member = message.guild!.members.cache.get((args.user as User)?.id ?? args.user);
		const user = member?.user ?? (await util.resolveNonCachedUser((args.user as User)?.id ?? args.user));
		if (!user) return message.util.reply(`${util.emojis.error} Invalid user.`);
		const useForce = args.force && message.author.isOwner();
		if (!message.member) throw new Error(`message.member is null`);

		const canModerateResponse = member ? await Moderation.permissionCheck(message.member, member, 'ban', true, useForce) : true;

		if (canModerateResponse !== true) {
			return await message.util.reply(canModerateResponse);
		}

		if (message.util.parsed?.alias === 'dban' && !args.days) args.days = 1;

		if (!Number.isInteger(args.days) || args.days! < 0 || args.days! > 7) {
			client.console.debug(args.days);

			return message.util.reply(`${util.emojis.error} The delete days must be an integer between 0 and 7.`);
		}

		let time: number | null;
		if (args.reason) {
			time = typeof args.reason === 'string' ? await util.arg.cast('duration', message, args.reason) : args.reason.duration;
		}
		const parsedReason = args.reason?.contentWithoutTime ?? null;

		const responseCode = member
			? await member.bushBan({
					reason: parsedReason,
					moderator: message.member,
					duration: time! ?? 0,
					deleteDays: args.days
			  })
			: await message.guild.bushBan({
					user,
					reason: parsedReason,
					moderator: message.member,
					duration: time! ?? 0,
					deleteDays: args.days
			  });

		const responseMessage = () => {
			const victim = util.format.input(user.tag);
			switch (responseCode) {
				case 'missing permissions':
					return `${util.emojis.error} Could not ban ${victim} because I am missing the **Ban Members** permission.`;
				case 'error banning':
					return `${util.emojis.error} An error occurred while trying to ban ${victim}.`;
				case 'error creating ban entry':
					return `${util.emojis.error} While banning ${victim}, there was an error creating a ban entry, please report this to my developers.`;
				case 'error creating modlog entry':
					return `${util.emojis.error} While banning ${victim}, there was an error creating a modlog entry, please report this to my developers.`;
				case 'failed to dm':
					return `${util.emojis.warn} Banned ${victim} however I could not send them a dm.`;
				case 'success':
					return `${util.emojis.success} Successfully banned ${victim}.`;
			}
		};
		return await message.util.reply({ content: responseMessage(), allowedMentions: AllowedMentions.none() });
	}
}
