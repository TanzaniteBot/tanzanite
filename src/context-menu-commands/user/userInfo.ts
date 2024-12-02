import { UserInfoCommand } from '#commands';
import { AllIntegrationTypes, AllInteractionContexts, TanzaniteClient } from '#lib';
import { ContextMenuCommand } from '@tanzanite/discord-akairo';
import {
	ApplicationCommandType,
	GuildMember,
	GuildMemberFlagsBitField,
	MessageFlags,
	PermissionsBitField,
	UserContextMenuCommandInteraction,
	type APIInteractionGuildMember,
	type PermissionResolvable
} from 'discord.js';

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

		const client = this.client as TanzaniteClient<true>;

		console.dir(interaction);

		const user = interaction.targetUser;

		const guild = interaction.guild ?? undefined;

		// todo: remove this if discord.js better handles target
		let member: GuildMember | Partial<GuildMember> | APIInteractionGuildMember | undefined =
			interaction.targetMember ?? undefined;

		if (!(member instanceof GuildMember) && member !== undefined) {
			const raw = member as APIInteractionGuildMember;

			const parseTime = (time: string | undefined | null) => (time != null ? Date.parse(time) : undefined);
			const parseAt = (time: string | undefined | null) => (time != null ? new Date(time) : undefined);

			member = {
				id: user.id,
				user: user,
				permissions: raw.permissions ? new PermissionsBitField(raw.permissions as PermissionResolvable) : undefined,
				nickname: raw.nick,
				avatar: raw.avatar,
				joinedTimestamp: parseTime(raw.joined_at),
				joinedAt: parseAt(raw.joined_at),
				premiumSinceTimestamp: parseTime(raw.premium_since),
				premiumSince: parseAt(raw.premium_since),
				client,
				// cheating, I deal with it manually
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				roles: raw.roles as any,
				flags: new GuildMemberFlagsBitField(raw.flags),

				toString() {
					return `<@&${this.id}>`;
				},

				valueOf() {
					return this.id!;
				}
			} satisfies Partial<GuildMember>;
		}

		const userEmbed = await UserInfoCommand.makeUserInfoEmbed(user, member, guild);

		return await interaction.editReply({ embeds: [userEmbed] });
	}
}
