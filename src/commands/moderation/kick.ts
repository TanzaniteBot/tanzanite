import {
	AllowedMentions,
	BushCommand,
	kickResponse,
	Moderation,
	type ArgType,
	type BushMessage,
	type BushSlashMessage
} from '#lib';
import assert from 'assert';
import { ApplicationCommandOptionType, PermissionFlagsBits } from 'discord.js';

export default class KickCommand extends BushCommand {
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
			clientPermissions: (m) => util.clientSendAndPermCheck(m, [PermissionFlagsBits.KickMembers]),
			userPermissions: [PermissionFlagsBits.KickMembers]
		});
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		{ user, reason, force }: { user: ArgType<'user'>; reason: ArgType<'string'>; force: boolean }
	) {
		assert(message.inGuild());
		assert(message.member);

		const member = await message.guild.members.fetch(user.id);

		if (!member)
			return await message.util.reply(`${util.emojis.error} The user you selected is not in the server or is not a valid user.`);
		const useForce = force && message.author.isOwner();
		const canModerateResponse = await Moderation.permissionCheck(message.member, member, 'kick', true, useForce);

		if (canModerateResponse !== true) {
			return message.util.reply(canModerateResponse);
		}

		const responseCode = await member.bushKick({
			reason,
			moderator: message.member
		});

		const responseMessage = (): string => {
			const victim = util.format.input(member.user.tag);
			switch (responseCode) {
				case kickResponse.MISSING_PERMISSIONS:
					return `${util.emojis.error} Could not kick ${victim} because I am missing the **Kick Members** permission.`;
				case kickResponse.ACTION_ERROR:
					return `${util.emojis.error} An error occurred while trying to kick ${victim}.`;
				case kickResponse.MODLOG_ERROR:
					return `${util.emojis.error} While muting ${victim}, there was an error creating a modlog entry, please report this to my developers.`;
				case kickResponse.DM_ERROR:
					return `${util.emojis.warn} Kicked ${victim} however I could not send them a dm.`;
				case kickResponse.SUCCESS:
					return `${util.emojis.success} Successfully kicked ${victim}.`;
				default:
					return `${util.emojis.error} An error occurred: ${util.format.input(responseCode)}}`;
			}
		};
		return await message.util.reply({ content: responseMessage(), allowedMentions: AllowedMentions.none() });
	}
}
