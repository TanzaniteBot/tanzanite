import { BotListener, Emitter, TanzaniteEvent, colors, type BotClientEvents } from '#lib';
import { EmbedBuilder, GuildMember } from 'discord.js';

export default class PunishRoleRemoveListener extends BotListener {
	public constructor() {
		super(TanzaniteEvent.PunishRoleRemove, {
			emitter: Emitter.Client,
			event: TanzaniteEvent.PunishRoleRemove
		});
	}

	public async exec(
		...[victim, moderator, guild, reason, caseID, role, evidence]: BotClientEvents[TanzaniteEvent.PunishRoleRemove]
	) {
		const logChannel = await guild.getLogChannel('moderation');
		if (!logChannel) return;
		const user = victim instanceof GuildMember ? victim.user : victim;

		const logEmbed = new EmbedBuilder()
			.setColor(colors.Green)
			.setTimestamp()
			.setFooter({ text: `CaseID: ${caseID}` })
			.setAuthor({ name: user.tag, iconURL: user.avatarURL({ extension: 'png', size: 4096 }) ?? undefined })
			.addFields(
				{ name: '**Action**', value: `${'Remove Punishment Role'}` },
				{ name: '**Role**', value: `${role}` },
				{ name: '**User**', value: `${user} (${user.tag})` },
				{ name: '**Moderator**', value: `${moderator} (${moderator.tag})` },
				{ name: '**Reason**', value: `${reason ? reason : '[No Reason Provided]'}` }
			);
		if (evidence) logEmbed.addFields({ name: '**Evidence**', value: evidence });
		return await logChannel.send({ embeds: [logEmbed] });
	}
}
