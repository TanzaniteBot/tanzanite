import { BotListener, Emitter, StickyRole, colors, format, type BotClientEvents } from '#lib';
import { Events, type GuildMember, type Snowflake } from 'discord.js';
import assert from 'node:assert';

export default class JoinRolesListener extends BotListener {
	public constructor() {
		super('joinRoles', {
			emitter: Emitter.Client,
			event: Events.GuildMemberUpdate // listens to guildMemberUpdate so that the role's aren't given before the member accepts the welcome screen
		});
	}

	public async exec(...[oldMember, newMember]: BotClientEvents[Events.GuildMemberUpdate]) {
		if (this.client.config.isDevelopment) return;
		if (oldMember.pending === true && !newMember.pending) {
			const feat = {
				stickyRoles: await newMember.guild.hasFeature('stickyRoles'),
				joinRoles: (await newMember.guild.getSetting('joinRoles')).length > 0
			};

			if (!feat.stickyRoles && !feat.joinRoles) return;

			let addJoinRoles = true;
			if (feat.stickyRoles) {
				const addedStickyRoles = await this.stickyRoles(newMember);
				if (addedStickyRoles) addJoinRoles = false;
			}

			if (feat.joinRoles && addJoinRoles) {
				void this.joinRoles(newMember);
			}
		}
	}

	/**
	 * Adds sticky roles to a user.
	 * @param member The member to add sticky roles to.
	 * @returns Whether or not sticky roles were added.
	 */
	private async stickyRoles(member: GuildMember): Promise<boolean> {
		const hadRoles = await StickyRole.findOne({ where: { guild: member.guild.id, user: member.id } });

		if ((hadRoles?.roles?.length ?? 0) > 0) {
			assert(hadRoles != null);
			const rolesArray = hadRoles.roles
				.map((roleID: Snowflake) => {
					const role = member.guild.roles.cache.get(roleID);
					if (role && !member.roles.cache.has(roleID)) {
						if (role.name !== '@everyone' || !role.managed) return role.id;
					}
				})
				.filter((role) => Boolean(role)) as Snowflake[];
			if (hadRoles.nickname && member.manageable) {
				void member.setNickname(hadRoles.nickname).catch(() => {});
			}
			if (rolesArray?.length) {
				const addedRoles = await member.roles.add(rolesArray, "Returning member's previous roles.").catch(() => {
					void member.guild.sendLogChannel('error', {
						embeds: [
							{
								title: 'Sticky Roles Error',
								description: `There was an error returning ${format.input(member.user.tag)}'s roles.`,
								color: colors.error
							}
						]
					});
					return false as const;
				});
				if (Boolean(addedRoles)) {
					void this.client.console.info(
						'guildMemberAdd',
						`Assigned sticky roles to ${format.inputLog(member.user.tag)} in ${format.inputLog(member.guild.name)}.`
					);
				} else {
					const failedRoles: string[] = [];
					for (let i = 0; i < rolesArray.length; i++) {
						await member.roles
							.add(rolesArray[i], "[Fallback] Returning member's previous roles.")
							.catch(() => failedRoles.push(rolesArray[i]));
					}
					if (failedRoles.length) {
						void this.client.console.warn('guildMemberAdd', `Failed assigning the following roles on Fallback: ${failedRoles}`);
					} else {
						void this.client.console.info(
							'guildMemberAdd',
							`[Fallback] Assigned sticky roles to ${format.inputLog(member.user.tag)} in ${format.inputLog(member.guild.name)}.`
						);
					}
				}
				return true;
			}
		}
		return false;
	}

	/**
	 * Add the guild's join roles to the member.
	 * @param member The member to add the join roles to.
	 */
	private async joinRoles(member: GuildMember): Promise<void> {
		const joinRoles = await member.guild.getSetting('joinRoles');
		if (joinRoles == null || !joinRoles.length) return;
		await member.roles
			.add(joinRoles, 'Join roles.')
			.then(() =>
				this.client.console.info(
					'guildMemberAdd',
					`Assigned join roles to ${format.inputLog(member.user.tag)} in ${format.inputLog(member.guild.name)}.`
				)
			)
			.catch(() =>
				member.guild.error(
					'Join Roles Error',
					`Failed to assign join roles to ${format.input(member.user.tag)}, in ${format.input(member.guild.name)}.`
				)
			);
	}
}
