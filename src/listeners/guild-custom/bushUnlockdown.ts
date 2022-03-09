import { BushListener, type BushClientEvents } from '#lib';
import { Embed } from 'discord.js';

export default class BushUnlockdownListener extends BushListener {
	public constructor() {
		super('bushUnlockdown', {
			emitter: 'client',
			event: 'bushUnlockdown',
			category: 'guild-custom'
		});
	}

	public override async exec(...[moderator, reason, channelsSuccessMap, _all]: BushClientEvents['bushUnlockdown']) {
		const logChannel = await moderator.guild.getLogChannel('moderation');
		if (!logChannel) return;

		const logEmbed = new Embed()
			.setColor(util.colors.Blurple)
			.setTimestamp()
			.addFields({ name: '**Action**', value: `${'Unlockdown'}` })
			.addFields({ name: '**Moderator**', value: `${moderator} (${moderator.user.tag})` })
			.addFields({ name: '**Reason**', value: `${reason ? reason : '[No Reason Provided]'}` })
			.addFields({
				name: `**Channel${channelsSuccessMap.size > 1 ? 's' : ''}**`,
				value: channelsSuccessMap
					.map((success, channel) => `<#${channel}> ${success ? util.emojis.success : util.emojis.error}`)
					.join('\n')
			});
		return await logChannel.send({ embeds: [logEmbed] });
	}
}
