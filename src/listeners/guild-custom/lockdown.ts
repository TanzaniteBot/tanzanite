import { BotListener, colors, emojis, type BotClientEvents } from '#lib';
import { EmbedBuilder } from 'discord.js';

export default class LockdownListener extends BotListener {
	public constructor() {
		super('lockdown', {
			emitter: 'client',
			event: 'lockdown'
		});
	}

	public async exec(...[moderator, reason, channelsSuccessMap, _all]: BotClientEvents['lockdown']) {
		const logChannel = await moderator.guild.getLogChannel('moderation');
		if (!logChannel) return;

		const logEmbed = new EmbedBuilder()
			.setColor(colors.Blurple)
			.setTimestamp()
			.addFields(
				{ name: '**Action**', value: `${'Lockdown'}` },
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
