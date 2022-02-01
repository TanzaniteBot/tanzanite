import {
	AllowedMentions,
	BushCommand,
	unbanResponse,
	type ArgType,
	type BushMessage,
	type BushSlashMessage,
	type OptionalArgType
} from '#lib';
import { ApplicationCommandOptionType, PermissionFlagsBits } from 'discord.js';

export default class UnbanCommand extends BushCommand {
	public constructor() {
		super('unban', {
			aliases: ['unban'],
			category: 'moderation',
			description: 'Unban a member from the server.',
			usage: ['unban <member> <reason>'],
			examples: ['unban 322862723090219008 I changed my mind, commands are allowed in #general'],
			args: [
				{
					id: 'user',
					description: 'The user to unban.',
					type: 'globalUser',
					prompt: 'What user would you like to unban?',
					retry: '{error} Choose a valid user to unban.',
					slashType: ApplicationCommandOptionType.User
				},
				{
					id: 'reason',
					description: 'The reason for the unban',
					type: 'string',
					match: 'restContent',
					prompt: 'Why should this user be unbanned?',
					retry: '{error} Choose a valid unban reason.',
					optional: true,
					slashType: ApplicationCommandOptionType.String
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
		{ user, reason }: { user: ArgType<'user'>; reason: OptionalArgType<'string'> }
	) {
		const responseCode = await message.guild!.bushUnban({
			user,
			moderator: message.author,
			reason
		});

		const responseMessage = (): string => {
			const victim = util.format.input(user.tag);
			switch (responseCode) {
				case unbanResponse.MISSING_PERMISSIONS:
					return `${util.emojis.error} Could not unban ${victim} because I am missing the **Ban Members** permission.`;
				case unbanResponse.ACTION_ERROR:
					return `${util.emojis.error} An error occurred while trying to unban ${victim}.`;
				case unbanResponse.PUNISHMENT_ENTRY_REMOVE_ERROR:
					return `${util.emojis.error} While unbanning ${victim}, there was an error removing their ban entry, please report this to my developers.`;
				case unbanResponse.MODLOG_ERROR:
					return `${util.emojis.error} While unbanning ${victim}, there was an error creating a modlog entry, please report this to my developers.`;
				case unbanResponse.NOT_BANNED:
					return `${util.emojis.warn} ${victim} is not banned but I tried to unban them anyways.`;
				case unbanResponse.DM_ERROR:
				case unbanResponse.SUCCESS:
					return `${util.emojis.success} Successfully unbanned ${victim}.`;
				default:
					return `${util.emojis.error} An error occurred: ${util.format.input(responseCode)}}`;
			}
		};
		return await message.util.reply({ content: responseMessage(), allowedMentions: AllowedMentions.none() });
	}
}
