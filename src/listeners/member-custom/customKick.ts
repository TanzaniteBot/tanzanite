import { BotListener, colors, TanzaniteEvent, type BotClientEvents } from '#lib';
import { EmbedBuilder, GuildMember } from 'discord.js';

export default class CustomKickListener extends BotListener {
	public constructor() {
		super(TanzaniteEvent.Kick, {
			emitter: 'client',
			event: TanzaniteEvent.Kick
		});
	}

	public async exec(...[victim, moderator, guild, reason, caseID, dmSuccess]: BotClientEvents[TanzaniteEvent.Kick]) {
		const logChannel = await guild.getLogChannel('moderation');
		if (!logChannel) return;
		const user = victim instanceof GuildMember ? victim.user : victim;

		const logEmbed = new EmbedBuilder()
			.setColor(colors.Red)
			.setTimestamp()
			.setFooter({ text: `CaseID: ${caseID}` })
			.setAuthor({ name: user.tag, iconURL: user.avatarURL({ extension: 'png', size: 4096 }) ?? undefined })
			.addFields(
				{ name: '**Action**', value: `${'Kick'}` },
				{ name: '**User**', value: `${user} (${user.tag})` },
				{ name: '**Moderator**', value: `${moderator} (${moderator.tag})` },
				{ name: '**Reason**', value: `${reason ? reason : '[No Reason Provided]'}` }
			);
		if (dmSuccess === false) logEmbed.addFields({ name: '**Additional Info**', value: 'Could not dm user.' });
		return await logChannel.send({ embeds: [logEmbed] });
	}
}
