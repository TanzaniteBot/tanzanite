import { BushListener, type BushClientEvents } from '#lib';
import { GuildMember, MessageEmbed } from 'discord.js';

export default class BushUnblockListener extends BushListener {
	public constructor() {
		super('bushUnblock', {
			emitter: 'client',
			event: 'bushUnblock',
			category: 'member-custom'
		});
	}

	public override async exec(...[victim, moderator, guild, reason, caseID, dmSuccess, channel]: BushClientEvents['bushUnblock']) {
		const logChannel = await guild.getLogChannel('moderation');
		if (!logChannel) return;
		const user = victim instanceof GuildMember ? victim.user : victim;

		const logEmbed = new MessageEmbed()
			.setColor(util.colors.discord.GREEN)
			.setTimestamp()
			.setFooter({ text: `CaseID: ${caseID}` })
			.setAuthor({ name: user.tag, iconURL: user.avatarURL({ dynamic: true, format: 'png', size: 4096 }) ?? undefined })
			.addField('**Action**', `${'Unblock'}`)
			.addField('**Channel**', `<#${channel.id}>`)
			.addField('**User**', `${user} (${user.tag})`)
			.addField('**Moderator**', `${moderator} (${moderator.tag})`)
			// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
			.addField('**Reason**', `${reason || '[No Reason Provided]'}`);
		if (dmSuccess === false) logEmbed.addField('**Additional Info**', 'Could not dm user.');
		return await logChannel.send({ embeds: [logEmbed] });
	}
}
