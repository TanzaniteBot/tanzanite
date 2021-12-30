import { BushListener, type BushClientEvents } from '#lib';
import { MessageEmbed } from 'discord.js';

export default class BushUnlockdownListener extends BushListener {
	public constructor() {
		super('bushUnlockdown', {
			emitter: 'client',
			event: 'bushUnlockdown',
			category: 'guild-custom'
		});
	}

	public override async exec(...[moderator, reason, channel, _all]: BushClientEvents['bushUnlockdown']) {
		const logChannel = await moderator.guild.getLogChannel('moderation');
		if (!logChannel) return;

		const logEmbed = new MessageEmbed()
			.setColor(util.colors.discord.BLURPLE)
			.setTimestamp()
			.addField('**Action**', `${'Unlockdown'}`)
			.addField('**Moderator**', `${moderator} (${moderator.user.tag})`)
			// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
			.addField('**Reason**', `${reason || '[No Reason Provided]'}`)
			.addField('**Channel**', `${channel?.id ? `<#${channel.id}>` : '[All Configured Channels]'}`);
		return await logChannel.send({ embeds: [logEmbed] });
	}
}
