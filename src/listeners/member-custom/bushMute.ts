import { BushListener, type BushClientEvents } from '#lib';
import { Embed, GuildMember } from 'discord.js';

export default class BushMuteListener extends BushListener {
	public constructor() {
		super('bushMute', {
			emitter: 'client',
			event: 'bushMute',
			category: 'member-custom'
		});
	}

	public override async exec(...[victim, moderator, guild, reason, caseID, duration, dmSuccess]: BushClientEvents['bushMute']) {
		const logChannel = await guild.getLogChannel('moderation');
		if (!logChannel) return;
		const user = victim instanceof GuildMember ? victim.user : victim;

		const logEmbed = new Embed()
			.setColor(util.colors.discord.ORANGE)
			.setTimestamp()
			.setFooter({ text: `CaseID: ${caseID}` })
			.setAuthor({ name: user.tag, iconURL: user.avatarURL({ format: 'png', size: 4096 }) ?? undefined })
			.addField({ name: '**Action**', value: `${duration ? 'Temp Mute' : 'Perm Mute'}` })
			.addField({ name: '**User**', value: `${user} (${user.tag})` })
			.addField({ name: '**Moderator**', value: `${moderator} (${moderator.tag})` })
			.addField({ name: '**Reason**', value: `${reason ? reason : '[No Reason Provided]'}` });
		if (duration) logEmbed.addField({ name: '**Duration**', value: `${util.humanizeDuration(duration) || duration}` });
		if (dmSuccess === false) logEmbed.addField({ name: '**Additional Info**', value: 'Could not dm user.' });
		return await logChannel.send({ embeds: [logEmbed] });
	}
}
