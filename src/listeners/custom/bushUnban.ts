import { BushListener } from '@lib';
import { GuildMember, MessageEmbed } from 'discord.js';
import { BushClientEvents } from '../../lib/extensions/discord.js/BushClientEvents';

export default class BushUnbanListener extends BushListener {
	public constructor() {
		super('bushUnban', {
			emitter: 'client',
			event: 'bushUnban',
			category: 'custom'
		});
	}

	public override async exec(
		...[victim, moderator, guild, reason, caseID, dmSuccess]: BushClientEvents['bushUnban']
	): Promise<unknown> {
		const logChannel = await guild.getLogChannel('moderation');
		if (!logChannel) return;
		const user = victim instanceof GuildMember ? victim.user : victim;

		const logEmbed = new MessageEmbed()
			.setColor(util.colors.discord.GREEN)
			.setTimestamp()
			.setFooter(`CaseID: ${caseID}`)
			.setAuthor(user.tag, user.avatarURL({ dynamic: true, format: 'png', size: 4096 }) ?? undefined)
			.addField('**Action**', `${'Unban'}`, true)
			.addField('**User**', `${user} (${user.tag})`, true)
			.addField('**Moderator**', `${moderator} (${moderator.tag})`, true)
			.addField('**Reason**', `${reason ?? '[No Reason Provided]'}`, true);
		if (dmSuccess === false) logEmbed.addField('**Additional Info**', 'Could not dm user.');
		return await logChannel.send({ embeds: [logEmbed] });
	}
}
