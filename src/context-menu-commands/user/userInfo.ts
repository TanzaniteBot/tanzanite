import { UserInfoCommand } from '#commands';
import { AllIntegrationTypes, AllInteractionContexts } from '#lib';
import { ContextMenuCommand } from '@tanzanite/discord-akairo';
import { ApplicationCommandType, GuildMember, MessageFlags, UserContextMenuCommandInteraction } from 'discord.js';
import assert from 'node:assert/strict';

export default class UserInfoContextMenuCommand extends ContextMenuCommand {
	public constructor() {
		super('userInfo', {
			name: 'User Info',
			type: ApplicationCommandType.User,
			category: 'user',
			dmPermission: true,
			contexts: AllInteractionContexts,
			integrationTypes: AllIntegrationTypes
		});
	}

	public override async exec(interaction: UserContextMenuCommandInteraction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const user = interaction.targetUser;

		const guild = interaction.guild ?? undefined;

		const member = interaction.targetMember ?? undefined;

		assert(member instanceof GuildMember || member === undefined);

		const userEmbed = await UserInfoCommand.makeUserInfoEmbed(user, member, guild);

		return await interaction.editReply({ embeds: [userEmbed] });
	}
}
