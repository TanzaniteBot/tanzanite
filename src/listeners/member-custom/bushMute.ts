import { BushListener, colors, humanizeDuration, type BushClientEvents } from '#lib';
import { EmbedBuilder, GuildMember } from 'discord.js';

export default class BushMuteListener extends BushListener {
	public constructor() {
		super('bushMute', {
			emitter: 'client',
			event: 'bushMute',
			category: 'member-custom'
		});
	}

	public async exec(...[victim, moderator, guild, reason, caseID, duration, dmSuccess]: BushClientEvents['bushMute']) {
		const logChannel = await guild.getLogChannel('moderation');
		if (!logChannel) return;
		const user = victim instanceof GuildMember ? victim.user : victim;

		const logEmbed = new EmbedBuilder()
			.setColor(colors.Orange)
			.setTimestamp()
			.setFooter({ text: `CaseID: ${caseID}` })
			.setAuthor({ name: user.tag, iconURL: user.avatarURL({ extension: 'png', size: 4096 }) ?? undefined })
			.addFields([
				{ name: '**Action**', value: `${duration ? 'Temp Mute' : 'Perm Mute'}` },
				{ name: '**User**', value: `${user} (${user.tag})` },
				{ name: '**Moderator**', value: `${moderator} (${moderator.tag})` },
				{ name: '**Reason**', value: `${reason ? reason : '[No Reason Provided]'}` }
			]);
		if (duration) logEmbed.addFields([{ name: '**Duration**', value: `${humanizeDuration(duration) || duration}` }]);
		if (dmSuccess === false) logEmbed.addFields([{ name: '**Additional Info**', value: 'Could not dm user.' }]);
		return await logChannel.send({ embeds: [logEmbed] });
	}
}
