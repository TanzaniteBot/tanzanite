import { BushListener } from '@lib';
import { GuildMember, MessageEmbed } from 'discord.js';
import { BushClientEvents } from '../../lib/extensions/discord.js/BushClientEvents';

export default class BushBanListener extends BushListener {
	public constructor() {
		super('bushBan', {
			emitter: 'client',
			event: 'bushBan',
			category: 'custom'
		});
	}

	public override async exec(
		...[victim, moderator, guild, reason, caseID, duration, dmSuccess]: BushClientEvents['bushBan']
	): Promise<unknown> {
		const logChannel = await guild.getLogChannel('moderation');
		if (!logChannel) return;
		const user = victim instanceof GuildMember ? victim.user : victim;

		const logEmbed = new MessageEmbed()
			.setColor(util.colors.discord.RED)
			.setTimestamp()
			.setFooter(`CaseID: ${caseID}`)
			.setAuthor(user.tag, user.avatarURL({ dynamic: true, format: 'png', size: 4096 }) ?? undefined)
			.addField('**Action**', `${duration ? 'Temp Ban' : 'Perm Ban'}`, true)
			.addField('**User**', `${user} (${user.tag})`, true)
			.addField('**Moderator**', `${moderator} (${moderator.tag})`, true)
			.addField('**Reason**', `${reason ?? '[No Reason Provided]'}`, true);
		if (duration) logEmbed.addField('**Duration**', util.humanizeDuration(duration), true);
		if (dmSuccess === false) logEmbed.addField('**Additional Info**', 'Could not dm user.');
		return await logChannel.send({ embeds: [logEmbed] });
	}
}
