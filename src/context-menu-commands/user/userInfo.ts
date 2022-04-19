import { UserInfoCommand } from '#commands';
import { type BushGuild, type BushGuildMember, type BushUser } from '#lib';
import { ContextMenuCommand } from 'discord-akairo';
import { ApplicationCommandType, type ContextMenuCommandInteraction } from 'discord.js';

export default class UserInfoContextMenuCommand extends ContextMenuCommand {
	public constructor() {
		super('userInfo', {
			name: 'User Info',
			type: ApplicationCommandType.User,
			category: 'user'
		});
	}

	public override async exec(interaction: ContextMenuCommandInteraction) {
		await interaction.deferReply({ ephemeral: true });

		const user = (await interaction.user.fetch()) as BushUser;
		const member = interaction.member as BushGuildMember;
		const guild = interaction.guild as BushGuild;
		const userEmbed = await UserInfoCommand.makeUserInfoEmbed(user, member, guild);

		return await interaction.editReply({ embeds: [userEmbed] });
	}
}
