import { BushListener } from '@lib';
import { GuildMember, MessageEmbed } from 'discord.js';
import { BushClientEvents } from '../../lib/extensions/discord.js/BushClientEvents';

export default class BushPunishRoleRemoveListener extends BushListener {
	public constructor() {
		super('bushPunishRoleRemove', {
			emitter: 'client',
			event: 'bushPunishRoleRemove',
			category: 'custom'
		});
	}

	public override async exec(
		...[victim, moderator, guild, reason, caseID, role]: BushClientEvents['bushPunishRoleRemove']
	): Promise<unknown> {
		const logChannel = await guild.getLogChannel('moderation');
		if (!logChannel) return;
		const user = victim instanceof GuildMember ? victim.user : victim;

		const logEmbed = new MessageEmbed()
			.setColor(util.colors.discord.GREEN)
			.setTimestamp()
			.setFooter(`CaseID: ${caseID}`)
			.setAuthor(user.tag, user.avatarURL({ dynamic: true, format: 'png', size: 4096 }) ?? undefined)
			.addField('**Action**', `${'Remove Punishment Role'}`, true)
			.addField('**Role**', `${role}`, true)
			.addField('**User**', `${user} (${user.tag})`, true)
			.addField('**Moderator**', `${moderator} (${moderator.tag})`, true)
			.addField('**Reason**', `${reason ?? '[No Reason Provided]'}`, true);

		return await logChannel.send({ embeds: [logEmbed] });
	}
}
