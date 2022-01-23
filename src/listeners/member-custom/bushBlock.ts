import { BushListener, type BushClientEvents } from '#lib';
import { GuildMember, MessageEmbed } from 'discord.js';

export default class BushBlockListener extends BushListener {
	public constructor() {
		super('bushBlock', {
			emitter: 'client',
			event: 'bushBlock',
			category: 'member-custom'
		});
	}

	public override async exec(
		...[victim, moderator, guild, reason, caseID, duration, dmSuccess, channel]: BushClientEvents['bushBlock']
	) {
		const logChannel = await guild.getLogChannel('moderation');
		if (!logChannel) return;
		const user = victim instanceof GuildMember ? victim.user : victim;

		const logEmbed = new MessageEmbed()
			.setColor(util.colors.discord.PURPLE)
			.setTimestamp()
			.setFooter({ text: `CaseID: ${caseID}` })
			.setAuthor({ name: user.tag, iconURL: user.avatarURL({ format: 'png', size: 4096 }) ?? undefined })
			.addField('**Action**', `${duration ? 'Temp Block' : 'Perm Block'}`)
			.addField('**Channel**', `<#${channel.id}>`)
			.addField('**User**', `${user} (${user.tag})`)
			.addField('**Moderator**', `${moderator} (${moderator.tag})`)
			.addField('**Reason**', `${reason ? reason : '[No Reason Provided]'}`);

		if (duration) logEmbed.addField('**Duration**', `${util.humanizeDuration(duration) || duration}`);
		if (dmSuccess === false) logEmbed.addField('**Additional Info**', 'Could not dm user.');
		return await logChannel.send({ embeds: [logEmbed] });
	}
}
