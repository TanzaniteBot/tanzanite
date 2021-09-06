import { BushListener } from '@lib';
import { GuildMember, MessageEmbed } from 'discord.js';
import { BushClientEvents } from '../../lib/extensions/discord.js/BushClientEvents';

export default class BushPunishRoleListener extends BushListener {
	public constructor() {
		super('bushPunishRole', {
			emitter: 'client',
			event: 'bushPunishRole',
			category: 'custom'
		});
	}

	public override async exec(
		...[victim, moderator, guild, reason, caseID, duration]: BushClientEvents['bushPunishRole']
	): Promise<unknown> {
		const logChannel = await guild.getLogChannel('moderation');
		if (!logChannel) return;
		const user = victim instanceof GuildMember ? victim.user : victim;

		const logEmbed = new MessageEmbed()
			.setColor(util.colors.discord.YELLOW)
			.setTimestamp()
			.setFooter(`CaseID: ${caseID}`)
			.setAuthor(user.tag, user.avatarURL({ dynamic: true, format: 'png', size: 4096 }) ?? undefined)
			.addField('**Action**', `${duration ? 'Temp Punishment Role' : 'Perm Punishment Role'}`, true)
			.addField('**User**', `${user} (${user.tag})`, true)
			.addField('**Moderator**', `${moderator} (${moderator.tag})`, true)
			.addField('**Reason**', `${reason ?? '[No Reason Provided]'}`, true);
		if (duration) logEmbed.addField('**Duration**', util.humanizeDuration(duration), true);
		return await logChannel.send({ embeds: [logEmbed] });
	}
}
