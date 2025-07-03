import { BotListener, Emitter, TanzaniteEvent, colors, humanizeDuration, type BotClientEvents } from '#lib';
import { EmbedBuilder, GuildMember } from 'discord.js';

export default class CustomBanListener extends BotListener {
	public constructor() {
		super(TanzaniteEvent.Ban, {
			emitter: Emitter.Client,
			event: TanzaniteEvent.Ban
		});
	}

	public async exec(
		...[victim, moderator, guild, reason, caseID, duration, dmSuccess, evidence]: BotClientEvents[TanzaniteEvent.Ban]
	) {
		const logChannel = await guild.getLogChannel('moderation');
		if (!logChannel) return;
		const user = victim instanceof GuildMember ? victim.user : victim;

		const logEmbed = new EmbedBuilder()
			.setColor(colors.Red)
			.setTimestamp()
			.setFooter({ text: `CaseID: ${caseID}` })
			.setAuthor({ name: user.tag, iconURL: user.avatarURL({ extension: 'png', size: 4096 }) ?? undefined })
			.addFields(
				{ name: '**Action**', value: `${duration ? 'Temp Ban' : 'Perm Ban'}` },
				{ name: '**User**', value: `${user} (${user.tag})` },
				{ name: '**Moderator**', value: `${moderator} (${moderator.tag})` },
				{ name: '**Reason**', value: `${(reason ?? '') ? reason!.substring(0, 1024) : '[No Reason Provided]'}` }
			);
		if (duration) logEmbed.addFields({ name: '**Duration**', value: humanizeDuration(duration) });
		if (dmSuccess === false) logEmbed.addFields({ name: '**Additional Info**', value: 'Could not dm user.' });
		if (evidence != null && evidence !== '') logEmbed.addFields({ name: '**Evidence**', value: evidence });
		return await logChannel.send({ embeds: [logEmbed] });
	}
}
