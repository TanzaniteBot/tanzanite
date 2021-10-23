import { BushClientEvents, BushListener } from '@lib';
import { MessageEmbed } from 'discord.js';

export default class BushUpdateModlogListener extends BushListener {
	public constructor() {
		super('bushUpdateModlog', {
			emitter: 'client',
			event: 'bushUpdateModlog',
			category: 'custom'
		});
	}

	public override async exec(
		...[moderator, modlogID, key, oldModlog, newModlog]: BushClientEvents['bushUpdateModlog']
	): Promise<unknown> {
		const logChannel = await moderator.guild.getLogChannel('moderation');
		if (!logChannel) return;

		const logEmbed = new MessageEmbed()
			.setColor(util.colors.discord.BLURPLE)
			.setTimestamp()
			.setAuthor(moderator.user.tag, moderator.user.avatarURL({ dynamic: true, format: 'png', size: 4096 }) ?? undefined)
			.addField('**Action**', `${'Update Modlog'}`)
			.addField('**Moderator**', `${moderator} (${moderator.user.tag})`)
			.addField('**ModLog Changed**', modlogID)
			.addField('**Value Changed**', key)
			.addField('**Old Value**', await util.inspectCleanRedactCodeblock(oldModlog, undefined, undefined, 1024))
			.addField('**New Value**', await util.inspectCleanRedactCodeblock(newModlog, undefined, undefined, 1024));

		return await logChannel.send({ embeds: [logEmbed] });
	}
}
