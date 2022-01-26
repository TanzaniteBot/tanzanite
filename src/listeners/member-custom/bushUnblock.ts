import { BushListener, type BushClientEvents } from '#lib';
import { Embed, GuildMember } from 'discord.js';

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

		const logEmbed = new Embed()
			.setColor(util.colors.discord.GREEN)
			.setTimestamp()
			.setFooter({ text: `CaseID: ${caseID}` })
			.setAuthor({ name: user.tag, iconURL: user.avatarURL({ format: 'png', size: 4096 }) ?? undefined })
			.addField({ name: '**Action**', value: `${'Unblock'}` })
			.addField({ name: '**Channel**', value: `<#${channel.id}>` })
			.addField({ name: '**User**', value: `${user} (${user.tag})` })
			.addField({ name: '**Moderator**', value: `${moderator} (${moderator.tag})` })
			.addField({ name: '**Reason**', value: `${reason ? reason : '[No Reason Provided]'}` });
		if (dmSuccess === false) logEmbed.addField({ name: '**Additional Info**', value: 'Could not dm user.' });
		return await logChannel.send({ embeds: [logEmbed] });
	}
}
