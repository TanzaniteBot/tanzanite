import {
	AllowedMentions,
	banResponse,
	BushCommand,
	Moderation,
	type ArgType,
	type BushMessage,
	type BushSlashMessage,
	type OptArgType
} from '#lib';
import assert from 'assert';
import { ApplicationCommandOptionType, PermissionFlagsBits } from 'discord.js';

export default class BanCommand extends BushCommand {
	public constructor() {
		super('ban', {
			aliases: ['ban', 'force-ban', 'dban'],
			category: 'moderation',
			description: 'Ban a member from the server.',
			usage: ['ban <member> [reasonAndDuration] [--days <days>]'],
			examples: ['ban ironm00n 1 day commands in #general --delete 7'],
			args: [
				{
					id: 'user',
					description: 'The user that will be banned.',
					type: util.arg.union('user', 'snowflake'),
					readableType: 'user|snowflake',
					prompt: 'What user would you like to ban?',
					retry: '{error} Choose a valid user to ban.',
					slashType: ApplicationCommandOptionType.User
				},
				{
					id: 'reason_and_duration',
					description: 'The reason and duration of the ban.',
					type: 'contentWithDuration',
					match: 'rest',
					prompt: 'Why should this user be banned and for how long?',
					retry: '{error} Choose a valid ban reason and duration.',
					slashType: ApplicationCommandOptionType.String,
					optional: true
				},
				{
					id: 'days',
					description: 'The number of days of messages to delete when the user is banned, defaults to 0.',
					flag: ['--days', '--delete'],
					match: 'option',
					prompt: "How many days of the user's messages would you like to delete?",
					retry: '{error} Choose between 0 and 7 days to delete messages from the user for.',
					type: util.arg.range('integer', 0, 7, true),
					readableType: 'integer [0, 7]',
					optional: true,
					slashType: ApplicationCommandOptionType.Integer,
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
			clientPermissions: [PermissionFlagsBits.BanMembers],
			userPermissions: [PermissionFlagsBits.BanMembers]
		});
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		args: {
			user: ArgType<'user'> | ArgType<'snowflake'>;
			reason_and_duration: OptArgType<'contentWithDuration'> | string;
			days: OptArgType<'integer'>;
			force: boolean;
		}
	) {
		assert(message.inGuild());
		assert(message.member);

		const { duration, content } = await util.castDurationContent(args.reason_and_duration, message);

		args.days ??= message.util.parsed?.alias === 'dban' ? 1 : 0;
		const member = message.guild.members.cache.get(typeof args.user === 'string' ? args.user : args.user.id);
		const user = member?.user ?? (await util.resolveNonCachedUser(typeof args.user === 'string' ? args.user : args.user.id));
		if (!user) return message.util.reply(`${util.emojis.error} Invalid user.`);
		const useForce = args.force && message.author.isOwner();

		const canModerateResponse = member ? await Moderation.permissionCheck(message.member, member, 'ban', true, useForce) : true;

		if (canModerateResponse !== true) {
			return await message.util.reply(canModerateResponse);
		}

		if (!Number.isInteger(args.days) || args.days! < 0 || args.days! > 7) {
			return message.util.reply(`${util.emojis.error} The delete days must be an integer between 0 and 7.`);
		}

		const opts = { reason: content, moderator: message.member, duration: duration, deleteDays: args.days };

		const responseCode = member ? await member.bushBan(opts) : await message.guild.bushBan({ user, ...opts });

		const responseMessage = (): string => {
			const victim = util.format.input(user.tag);
			switch (responseCode) {
				case banResponse.ALREADY_BANNED:
					return `${util.emojis.error} ${victim} is already banned.`;
				case banResponse.MISSING_PERMISSIONS:
					return `${util.emojis.error} Could not ban ${victim} because I am missing the **Ban Members** permission.`;
				case banResponse.ACTION_ERROR:
					return `${util.emojis.error} An error occurred while trying to ban ${victim}.`;
				case banResponse.PUNISHMENT_ENTRY_ADD_ERROR:
					return `${util.emojis.error} While banning ${victim}, there was an error creating a ban entry, please report this to my developers.`;
				case banResponse.MODLOG_ERROR:
					return `${util.emojis.error} While banning ${victim}, there was an error creating a modlog entry, please report this to my developers.`;
				case banResponse.DM_ERROR:
					return `${util.emojis.warn} Banned ${victim} however I could not send them a dm.`;
				case banResponse.SUCCESS:
					return `${util.emojis.success} Successfully banned ${victim}.`;
				default:
					return `${util.emojis.error} An error occurred: ${util.format.input(responseCode)}}`;
			}
		};
		return await message.util.reply({ content: responseMessage(), allowedMentions: AllowedMentions.none() });
	}
}
