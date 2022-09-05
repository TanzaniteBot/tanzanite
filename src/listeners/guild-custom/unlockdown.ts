import { BotListener, colors, Emitter, emojis, TanzaniteEvent, type BotClientEvents } from '#lib';
import { EmbedBuilder } from 'discord.js';

export default class UnlockdownListener extends BotListener {
	public constructor() {
		super(TanzaniteEvent.Unlockdown, {
			emitter: Emitter.Client,
			event: TanzaniteEvent.Unlockdown
		});
	}

	public async exec(...[moderator, reason, channelsSuccessMap, _all]: BotClientEvents[TanzaniteEvent.Unlockdown]) {
		const logChannel = await moderator.guild.getLogChannel('moderation');
		if (!logChannel) return;

		const logEmbed = new EmbedBuilder()
			.setColor(colors.Blurple)
			.setTimestamp()
			.addFields(
				{ name: '**Action**', value: `${'Unlockdown'}` },
				{ name: '**Moderator**', value: `${moderator} (${moderator.user.tag})` },
				{ name: '**Reason**', value: `${reason ? reason : '[No Reason Provided]'}` },
				{
					name: `**Channel${channelsSuccessMap.size > 1 ? 's' : ''}**`,
					value: channelsSuccessMap
						.map((success, channel) => `<#${channel}> ${success ? emojis.success : emojis.error}`)
						.join('\n')
				}
			);
		return await logChannel.send({ embeds: [logEmbed] });
	}
}
