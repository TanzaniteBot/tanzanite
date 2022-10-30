import { UserInfoCommand } from '#commands';
import { emojis } from '#lib';
import { ContextMenuCommand } from '@notenoughupdates/discord-akairo';
import { ApplicationCommandType, GuildMember, UserContextMenuCommandInteraction } from 'discord.js';
import assert from 'node:assert/strict';

export default class UserInfoContextMenuCommand extends ContextMenuCommand {
	public constructor() {
		super('userInfo', {
			name: 'User Info',
			type: ApplicationCommandType.User,
			category: 'user',
			dmPermission: false
		});
	}

	public override async exec(interaction: UserContextMenuCommandInteraction) {
		if (!interaction.inCachedGuild())
			return interaction.reply({
				content: `${emojis.error} You can't use this command outside of a server.`,
				ephemeral: true
			});

		await interaction.deferReply({ ephemeral: true });

		const user = interaction.targetUser;

		const guild = interaction.guild ?? undefined;

		const member = interaction.targetMember ?? undefined;

		assert(member instanceof GuildMember || member === undefined);

		const userEmbed = await UserInfoCommand.makeUserInfoEmbed(user, member, guild);

		return await interaction.editReply({ embeds: [userEmbed] });
	}
}
