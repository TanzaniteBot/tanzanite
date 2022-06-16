import { BushListener, colors, emojis, type BushClientEvents } from '#lib';
import { EmbedBuilder } from 'discord.js';

export default class BushUnlockdownListener extends BushListener {
	public constructor() {
		super('bushUnlockdown', {
			emitter: 'client',
			event: 'bushUnlockdown',
			category: 'guild-custom'
		});
	}

	public async exec(...[moderator, reason, channelsSuccessMap, _all]: BushClientEvents['bushUnlockdown']) {
		const logChannel = await moderator.guild.getLogChannel('moderation');
		if (!logChannel) return;

		const logEmbed = new EmbedBuilder()
			.setColor(colors.Blurple)
			.setTimestamp()
			.addFields([
				{ name: '**Action**', value: `${'Unlockdown'}` },
				{ name: '**Moderator**', value: `${moderator} (${moderator.user.tag})` },
				{ name: '**Reason**', value: `${reason ? reason : '[No Reason Provided]'}` },
				{
					name: `**Channel${channelsSuccessMap.size > 1 ? 's' : ''}**`,
					value: channelsSuccessMap
						.map((success, channel) => `<#${channel}> ${success ? emojis.success : emojis.error}`)
						.join('\n')
				}
			]);
		return await logChannel.send({ embeds: [logEmbed] });
	}
}
