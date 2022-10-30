import {
	AllowedMentions,
	Arg,
	BotCommand,
	castDurationContent,
	emojis,
	formatBanResponse,
	Moderation,
	Time,
	type ArgType,
	type CommandMessage,
	type OptArgType,
	type SlashMessage
} from '#lib';
import { ApplicationCommandOptionType } from 'discord.js';
import assert from 'node:assert/strict';

export default class BanCommand extends BotCommand {
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
					type: Arg.union('user', 'snowflake'),
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
					type: Arg.range('integer', 0, 7, true),
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
			clientPermissions: ['BanMembers'],
			userPermissions: ['BanMembers']
		});
	}

	public override async exec(
		message: CommandMessage | SlashMessage,
		args: {
			user: ArgType<'user' | 'snowflake'>;
			reason_and_duration: OptArgType<'contentWithDuration'> | string;
			days: OptArgType<'integer'>;
			force: ArgType<'flag'>;
		}
	) {
		assert(message.inGuild());
		assert(message.member);

		const { duration, content } = await castDurationContent(args.reason_and_duration, message);

		args.days ??= message.util.parsed?.alias === 'dban' ? 1 : 0;
		const member = message.guild.members.cache.get(typeof args.user === 'string' ? args.user : args.user.id);
		const user =
			member?.user ?? (await this.client.utils.resolveNonCachedUser(typeof args.user === 'string' ? args.user : args.user.id));
		if (!user) return message.util.reply(`${emojis.error} Invalid user.`);
		const useForce = args.force && message.author.isOwner();

		const canModerateResponse = member
			? await Moderation.permissionCheck(message.member, member, Moderation.Action.Ban, true, useForce)
			: true;

		if (canModerateResponse !== true) {
			return await message.util.reply(canModerateResponse);
		}

		if (!Number.isInteger(args.days) || args.days! < 0 || args.days! > 7) {
			return message.util.reply(`${emojis.error} The delete days must be an integer between 0 and 7.`);
		}

		const opts = {
			reason: content,
			moderator: message.member,
			duration: duration,
			deleteMessageSeconds: (args.days * Time.Day) / Time.Second
		};

		const responseCode = member ? await member.customBan(opts) : await message.guild.customBan({ user, ...opts });

		return await message.util.reply({
			content: formatBanResponse(user, responseCode),
			allowedMentions: AllowedMentions.none()
		});
	}
}
