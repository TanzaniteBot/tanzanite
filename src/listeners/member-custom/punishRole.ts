import { BotListener, Emitter, TanzaniteEvent, colors, humanizeDuration, type BotClientEvents } from '#lib';
import { EmbedBuilder, GuildMember } from 'discord.js';

export default class PunishRoleListener extends BotListener {
	public constructor() {
		super(TanzaniteEvent.PunishRoleAdd, {
			emitter: Emitter.Client,
			event: TanzaniteEvent.PunishRoleAdd
		});
	}

	public async exec(
		...[victim, moderator, guild, reason, caseID, duration, role, evidence]: BotClientEvents[TanzaniteEvent.PunishRoleAdd]
	) {
		const logChannel = await guild.getLogChannel('moderation');
		if (!logChannel) return;
		const user = victim instanceof GuildMember ? victim.user : victim;

		const logEmbed = new EmbedBuilder()
			.setColor(colors.Yellow)
			.setTimestamp()
			.setFooter({ text: `CaseID: ${caseID}` })
			.setAuthor({ name: user.tag, iconURL: user.avatarURL({ extension: 'png', size: 4096 }) ?? undefined })
			.addFields(
				{ name: '**Action**', value: `${duration ? 'Temp Punishment Role' : 'Perm Punishment Role'}` },
				{ name: '**Role**', value: `${role}` },
				{ name: '**User**', value: `${user} (${user.tag})` },
				{ name: '**Moderator**', value: `${moderator} (${moderator.tag})` },
				{ name: '**Reason**', value: `${(reason ?? '') || '[No Reason Provided]'}` }
			);
		if (duration) logEmbed.addFields({ name: '**Duration**', value: humanizeDuration(duration) });
		if (evidence != null && evidence !== '') logEmbed.addFields({ name: '**Evidence**', value: evidence });
		return await logChannel.send({ embeds: [logEmbed] });
	}
}
