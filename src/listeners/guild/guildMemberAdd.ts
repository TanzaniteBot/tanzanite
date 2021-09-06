import { MessageEmbed, Snowflake, Util } from 'discord.js';
import { BushGuildMember, BushListener, BushTextChannel, StickyRole } from '../../lib';
import { BushClientEvents } from '../../lib/extensions/discord.js/BushClientEvents';

export default class GuildMemberAddListener extends BushListener {
	public constructor() {
		super('guildMemberAdd', {
			emitter: 'client',
			event: 'guildMemberAdd',
			category: 'guild'
		});
	}

	public override async exec(...[member]: BushClientEvents['guildMemberAdd']): Promise<void> {
		void this.sendWelcomeMessage(member);
		void this.joinAndStickyRoles(member);
	}

	public async sendWelcomeMessage(member: BushGuildMember): Promise<void> {
		if (client.config.isDevelopment) return;
		const welcomeChannel = await member.guild.getSetting('welcomeChannel');
		if (!welcomeChannel) return;
		const welcome = client.channels.cache.get(welcomeChannel) as BushTextChannel | undefined;
		if (!welcome) return;
		if (member.guild.id !== welcome?.guild.id) throw new Error('Welcome channel must be in the guild.');
		const embed = new MessageEmbed()
			.setDescription(
				`${util.emojis.join} **${Util.escapeMarkdown(
					member.user.tag
				)}** joined the server. There are now ${member.guild.memberCount.toLocaleString()} members.`
			)
			.setColor(util.colors.green);
		await welcome
			.send({ embeds: [embed] })
			.then(() =>
				client.console.info('guildMemberAdd', `Sent a message for <<${member.user.tag}>> in <<${member.guild.name}>>.`)
			)
			.catch(() =>
				client.console.warn('guildMemberAdd', `Failed to send message for <<${member.user.tag}>> in <<${member.guild.name}>>.`)
			);
	}

	public async joinAndStickyRoles(member: BushGuildMember): Promise<void> {
		if (client.config.isDevelopment) return;
		if (await member.guild.hasFeature('stickyRoles')) {
			const hadRoles = await StickyRole.findOne({ where: { guild: member.guild.id, user: member.id } });
			if (hadRoles?.roles?.length) {
				const rolesArray = hadRoles.roles
					.map((roleID: Snowflake) => {
						const role = member.guild.roles.cache.get(roleID);
						if (role && !member.roles.cache.has(roleID)) {
							if (role.name !== '@everyone' || !role.managed) return role.id;
						}
					})
					.filter((role) => role) as Snowflake[];
				if (hadRoles.nickname && member.manageable) {
					void member.setNickname(hadRoles.nickname).catch(() => {});
				}
				if (rolesArray?.length) {
					const addedRoles = await member.roles
						.add(rolesArray, "Returning member's previous roles.")
						.catch(
							() => void client.console.warn('guildMemberAdd', `There was an error returning <<${member.user.tag}>>'s roles.`)
						);
					if (addedRoles) {
						void client.console.info(
							'guildMemberAdd',
							`Assigned sticky roles to <<${member.user.tag}>> in <<${member.guild.name}>>.`
						);
					} else if (!addedRoles) {
						const failedRoles: string[] = [];
						for (let i = 0; i < rolesArray.length; i++) {
							await member.roles
								.add(rolesArray[i], "[Fallback] Returning member's previous roles.")
								.catch(() => failedRoles.push(rolesArray[i]));
						}
						if (failedRoles.length) {
							void client.console.warn('guildMemberAdd', `Failed assigning the following roles on Fallback:${failedRoles}`);
						} else {
							void client.console.info(
								'guildMemberAdd',
								`[Fallback] Assigned sticky roles to <<${member.user.tag}>> in <<${member.guild.name}>>.`
							);
						}
					}
				}
			} else {
				const joinRoles = await member.guild.getSetting('joinRoles');
				if (!joinRoles || !joinRoles.length) return;
				await member.roles
					.add(joinRoles, 'Join roles.')
					.then(() =>
						client.console.info('guildMemberAdd', `Assigned join roles to <<${member.user.tag}>> in <<${member.guild.name}>>.`)
					)
					.catch(
						() =>
							void client.console.warn(
								'guildMemberAdd',
								`Failed to assign join roles to <<${member.user.tag}>>, in <<${member.guild.name}>>.`
							)
					);
			}
		}
	}
}
