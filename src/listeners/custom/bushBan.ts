import { BushListener, type BushClientEvents } from '@lib';
import { GuildMember, MessageEmbed } from 'discord.js';

export default class BushBanListener extends BushListener {
	public constructor() {
		super('bushBan', {
			emitter: 'client',
			event: 'bushBan',
			category: 'custom'
		});
	}

	public override async exec(...[victim, moderator, guild, reason, caseID, duration, dmSuccess]: BushClientEvents['bushBan']) {
		const logChannel = await guild.getLogChannel('moderation');
		if (!logChannel) return;
		const user = victim instanceof GuildMember ? victim.user : victim;

		const logEmbed = new MessageEmbed()
			.setColor(util.colors.discord.RED)
			.setTimestamp()
			.setFooter(`CaseID: ${caseID}`)
			.setAuthor(user.tag, user.avatarURL({ dynamic: true, format: 'png', size: 4096 }) ?? undefined)
			.addField('**Action**', `${duration ? 'Temp Ban' : 'Perm Ban'}`)
			.addField('**User**', `${user} (${user.tag})`)
			.addField('**Moderator**', `${moderator} (${moderator.tag})`)
			// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
			.addField('**Reason**', `${reason || '[No Reason Provided]'}`);
		if (duration) logEmbed.addField('**Duration**', util.humanizeDuration(duration));
		if (dmSuccess === false) logEmbed.addField('**Additional Info**', 'Could not dm user.');
		return await logChannel.send({ embeds: [logEmbed] });
	}
}
