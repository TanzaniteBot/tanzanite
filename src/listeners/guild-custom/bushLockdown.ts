import { BushListener, type BushClientEvents } from '#lib';
import { MessageEmbed } from 'discord.js';

export default class BushLockdownListener extends BushListener {
	public constructor() {
		super('bushLockdown', {
			emitter: 'client',
			event: 'bushLockdown',
			category: 'guild-custom'
		});
	}

	public override async exec(...[moderator, reason, channelsSuccessMap, _all]: BushClientEvents['bushLockdown']) {
		const logChannel = await moderator.guild.getLogChannel('moderation');
		if (!logChannel) return;

		const logEmbed = new MessageEmbed()
			.setColor(util.colors.discord.BLURPLE)
			.setTimestamp()
			.addField('**Action**', `${'Lockdown'}`)
			.addField('**Moderator**', `${moderator} (${moderator.user.tag})`)
			// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
			.addField('**Reason**', `${reason || '[No Reason Provided]'}`)
			.addField(
				`**Channel${channelsSuccessMap.size > 1 ? 's' : ''}**`,
				channelsSuccessMap
					.map((success, channel) => `<#${channel}> ${success ? util.emojis.success : util.emojis.error}`)
					.join('\n')
			);
		return await logChannel.send({ embeds: [logEmbed] });
	}
}
