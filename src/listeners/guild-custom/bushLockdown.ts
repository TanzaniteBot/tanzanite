import { BushListener, type BushClientEvents } from '#lib';
import { Embed } from 'discord.js';

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

		const logEmbed = new Embed()
			.setColor(util.colors.BLURPLE)
			.setTimestamp()
			.addField({ name: '**Action**', value: `${'Lockdown'}` })
			.addField({ name: '**Moderator**', value: `${moderator} (${moderator.user.tag})` })
			.addField({ name: '**Reason**', value: `${reason ? reason : '[No Reason Provided]'}` })
			.addField({
				name: `**Channel${channelsSuccessMap.size > 1 ? 's' : ''}**`,
				value: channelsSuccessMap
					.map((success, channel) => `<#${channel}> ${success ? util.emojis.success : util.emojis.error}`)
					.join('\n')
			});
		return await logChannel.send({ embeds: [logEmbed] });
	}
}
