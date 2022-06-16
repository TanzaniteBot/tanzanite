import { BushListener, colors, emojis, type BushClientEvents } from '#lib';
import { EmbedBuilder } from 'discord.js';

export default class BushLockdownListener extends BushListener {
	public constructor() {
		super('bushLockdown', {
			emitter: 'client',
			event: 'bushLockdown',
			category: 'guild-custom'
		});
	}

	public async exec(...[moderator, reason, channelsSuccessMap, _all]: BushClientEvents['bushLockdown']) {
		const logChannel = await moderator.guild.getLogChannel('moderation');
		if (!logChannel) return;

		const logEmbed = new EmbedBuilder()
			.setColor(colors.Blurple)
			.setTimestamp()
			.addFields([
				{ name: '**Action**', value: `${'Lockdown'}` },
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
