import { BushListener, type BushClientEvents } from '#lib';
import { GuildMember, MessageEmbed } from 'discord.js';

export default class BushTimeoutListener extends BushListener {
	public constructor() {
		super('bushTimeout', {
			emitter: 'client',
			event: 'bushTimeout',
			category: 'member-custom'
		});
	}

	public override async exec(
		...[victim, moderator, guild, reason, caseID, duration, dmSuccess]: BushClientEvents['bushTimeout']
	) {
		const logChannel = await guild.getLogChannel('moderation');
		if (!logChannel) return;
		const user = victim instanceof GuildMember ? victim.user : victim;

		const logEmbed = new MessageEmbed()
			.setColor(util.colors.discord.ORANGE)
			.setTimestamp()
			.setFooter({ text: `CaseID: ${caseID}` })
			.setAuthor({ name: user.tag, iconURL: user.avatarURL({ format: 'png', size: 4096 }) ?? undefined })
			.addField('**Action**', `${'Timeout'}`)
			.addField('**User**', `${user} (${user.tag})`)
			.addField('**Moderator**', `${moderator} (${moderator.tag})`)
			.addField('**Reason**', `${reason ? reason : '[No Reason Provided]'}`)
			.addField('**Duration**', `${util.humanizeDuration(duration) || duration}`);
		if (dmSuccess === false) logEmbed.addField('**Additional Info**', 'Could not dm user.');
		return await logChannel.send({ embeds: [logEmbed] });
	}
}
