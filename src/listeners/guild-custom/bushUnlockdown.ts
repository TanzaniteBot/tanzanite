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
			.setColor(util.colors.discord.BLURPLE)
			.setTimestamp()
			.addField({ name: '**Action**', value: `${'Unlockdown'}` })
			.addField({ name: '**Moderator**', value: `${moderator} (${moderator.user.tag})` })
			// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
			.addField({ name: '**Reason**', value: `${reason || '[No Reason Provided]'}` })
			.addField({
				name: `**Channel${channelsSuccessMap.size > 1 ? 's' : ''}**`,
				value: channelsSuccessMap
					.map((success, channel) => `<#${channel}> ${success ? util.emojis.success : util.emojis.error}`)
					.join('\n')
			});
		return await logChannel.send({ embeds: [logEmbed] });
	}
}
