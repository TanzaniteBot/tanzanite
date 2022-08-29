import {
	AllowedMentions,
	BotCommand,
	clientSendAndPermCheck,
	emojis,
	format,
	kickResponse,
	Moderation,
	type ArgType,
	type CommandMessage,
	type KickResponse,
	type OptArgType,
	type SlashMessage
} from '#lib';
import assert from 'assert/strict';
import { ApplicationCommandOptionType, PermissionFlagsBits, type GuildMember } from 'discord.js';

export default class KickCommand extends BotCommand {
	public constructor() {
		super('kick', {
			aliases: ['kick'],
			category: 'moderation',
			description: 'Kick a user.',
			usage: ['kick <member> <reason>'],
			examples: ['kick @user bad'],
			args: [
				{
					id: 'user',
					description: 'The user to kick.',
					type: 'user',
					prompt: 'What user would you like to kick?',
					retry: '{error} Choose a valid user to kick.',
					slashType: ApplicationCommandOptionType.User
				},
				{
					id: 'reason',
					description: 'The reason for the kick.',
					type: 'string',
					match: 'rest',
					prompt: 'Why should this user be kicked?',
					retry: '{error} Choose a valid kick reason.',
					optional: true,
					slashType: ApplicationCommandOptionType.String
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
			clientPermissions: (m) => clientSendAndPermCheck(m, [PermissionFlagsBits.KickMembers]),
			userPermissions: [PermissionFlagsBits.KickMembers]
		});
	}

	public override async exec(
		message: CommandMessage | SlashMessage,
		{ user, reason, force }: { user: ArgType<'user'>; reason: OptArgType<'string'>; force: ArgType<'flag'> }
	) {
		assert(message.inGuild());
		assert(message.member);

		const member = await message.guild.members.fetch(user.id);

		if (!member)
			return await message.util.reply(`${emojis.error} The user you selected is not in the server or is not a valid user.`);
		const useForce = force && message.author.isOwner();
		const canModerateResponse = await Moderation.permissionCheck(message.member, member, 'kick', true, useForce);

		if (canModerateResponse !== true) {
			return message.util.reply(canModerateResponse);
		}

		const responseCode = await member.customKick({
			reason,
			moderator: message.member
		});

		return await message.util.reply({
			content: KickCommand.formatCode(member, responseCode),
			allowedMentions: AllowedMentions.none()
		});
	}

	public static formatCode(member: GuildMember, code: KickResponse): string {
		const victim = format.input(member.user.tag);
		switch (code) {
			case kickResponse.MISSING_PERMISSIONS:
				return `${emojis.error} Could not kick ${victim} because I am missing the **Kick Members** permission.`;
			case kickResponse.ACTION_ERROR:
				return `${emojis.error} An error occurred while trying to kick ${victim}.`;
			case kickResponse.MODLOG_ERROR:
				return `${emojis.error} While muting ${victim}, there was an error creating a modlog entry, please report this to my developers.`;
			case kickResponse.DM_ERROR:
				return `${emojis.warn} Kicked ${victim} however I could not send them a dm.`;
			case kickResponse.SUCCESS:
				return `${emojis.success} Successfully kicked ${victim}.`;
			default:
				return `${emojis.error} An error occurred: ${format.input(code)}}`;
		}
	}
}
