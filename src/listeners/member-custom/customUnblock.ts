import { BotListener, Emitter, TanzaniteEvent, colors, type BotClientEvents } from '#lib';
import { EmbedBuilder, GuildMember } from 'discord.js';

export default class CustomUnblockListener extends BotListener {
	public constructor() {
		super(TanzaniteEvent.Unblock, {
			emitter: Emitter.Client,
			event: TanzaniteEvent.Unblock
		});
	}

	public async exec(
		...[victim, moderator, guild, reason, caseID, dmSuccess, channel, evidence]: BotClientEvents[TanzaniteEvent.Unblock]
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
				{ name: '**Action**', value: `${'Unblock'}` },
				{ name: '**Channel**', value: `<#${channel.id}>` },
				{ name: '**User**', value: `${user} (${user.tag})` },
				{ name: '**Moderator**', value: `${moderator} (${moderator.tag})` },
				{ name: '**Reason**', value: `${(reason ?? '') || '[No Reason Provided]'}` }
			);
		if (dmSuccess === false) logEmbed.addFields({ name: '**Additional Info**', value: 'Could not dm user.' });
		if (evidence != null && evidence !== '') logEmbed.addFields({ name: '**Evidence**', value: evidence });
		return await logChannel.send({ embeds: [logEmbed] });
	}
}
