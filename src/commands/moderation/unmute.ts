import {
	AllowedMentions,
	BushCommand,
	clientSendAndPermCheck,
	emojis,
	format,
	Moderation,
	unmuteResponse,
	userGuildPermCheck,
	type ArgType,
	type CommandMessage,
	type OptArgType,
	type SlashMessage
} from '#lib';
import assert from 'assert';
import { ApplicationCommandOptionType, PermissionFlagsBits } from 'discord.js';

export default class UnmuteCommand extends BushCommand {
	public constructor() {
		super('unmute', {
			aliases: ['unmute'],
			category: 'moderation',
			description: 'unmute a user.',
			usage: ['unmute <member> [reason]'],
			examples: ['unmute 322862723090219008 you have been forgiven'],
			args: [
				{
					id: 'user',
					description: 'The user to unmute.',
					type: 'user',
					prompt: 'What user would you like to unmute?',
					retry: '{error} Choose a valid user to unmute.',
					slashType: ApplicationCommandOptionType.User
				},
				{
					id: 'reason',
					description: 'The reason for the unmute.',
					type: 'string',
					match: 'rest',
					prompt: 'Why should this user be unmuted?',
					retry: '{error} Choose a valid unmute reason.',
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
			channel: 'guild',
			clientPermissions: (m) => clientSendAndPermCheck(m, [PermissionFlagsBits.ManageRoles]),
			userPermissions: (m) => userGuildPermCheck(m, [PermissionFlagsBits.ManageMessages])
		});
	}

	public override async exec(
		message: CommandMessage | SlashMessage,
		{ user, reason, force = false }: { user: ArgType<'user'>; reason: OptArgType<'string'>; force?: ArgType<'flag'> }
	) {
		assert(message.inGuild());
		assert(message.member);

		const error = emojis.error;
		const member = message.guild.members.cache.get(user.id)!;

		const useForce = force && message.author.isOwner();
		const canModerateResponse = await Moderation.permissionCheck(message.member, member, 'unmute', true, useForce);

		if (canModerateResponse !== true) {
			return message.util.reply(canModerateResponse);
		}

		const responseCode = await member.bushUnmute({
			reason,
			moderator: message.member
		});

		const responseMessage = (): string => {
			const prefix_ = this.client.utils.prefix(message);
			const victim = format.input(member.user.tag);
			switch (responseCode) {
				case unmuteResponse.MISSING_PERMISSIONS:
					return `${error} Could not unmute ${victim} because I am missing the **Manage Roles** permission.`;
				case unmuteResponse.NO_MUTE_ROLE:
					return `${error} Could not unmute ${victim}, you must set a mute role with \`${prefix_}config muteRole\`.`;
				case unmuteResponse.MUTE_ROLE_INVALID:
					return `${error} Could not unmute ${victim} because the current mute role no longer exists. Please set a new mute role with \`${prefix_}config muteRole\`.`;
				case unmuteResponse.MUTE_ROLE_NOT_MANAGEABLE:
					return `${error} Could not unmute ${victim} because I cannot assign the current mute role, either change the role's position or set a new mute role with \`${prefix_}config muteRole\`.`;
				case unmuteResponse.ACTION_ERROR:
					return `${error} Could not unmute ${victim}, there was an error removing their mute role.`;
				case unmuteResponse.MODLOG_ERROR:
					return `${error} While muting ${victim}, there was an error creating a modlog entry, please report this to my developers.`;
				case unmuteResponse.PUNISHMENT_ENTRY_REMOVE_ERROR:
					return `${error} While muting ${victim}, there was an error removing their mute entry, please report this to my developers.`;
				case unmuteResponse.DM_ERROR:
					return `${emojis.warn} unmuted ${victim} however I could not send them a dm.`;
				case unmuteResponse.SUCCESS:
					return `${emojis.success} Successfully unmuted ${victim}.`;
				default:
					return `${emojis.error} An error occurred: ${format.input(responseCode)}}`;
			}
		};
		return await message.util.reply({ content: responseMessage(), allowedMentions: AllowedMentions.none() });
	}
}
