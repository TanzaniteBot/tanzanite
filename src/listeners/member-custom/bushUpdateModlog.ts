import { BushListener, type BushClientEvents } from '#lib';
import { EmbedBuilder } from 'discord.js';

export default class BushUpdateModlogListener extends BushListener {
	public constructor() {
		super('bushUpdateModlog', {
			emitter: 'client',
			event: 'bushUpdateModlog',
			category: 'member-custom'
		});
	}

	public override async exec(...[moderator, modlogID, key, oldModlog, newModlog]: BushClientEvents['bushUpdateModlog']) {
		const logChannel = await moderator.guild.getLogChannel('moderation');
		if (!logChannel) return;

		const logEmbed = new EmbedBuilder()
			.setColor(util.colors.Blurple)
			.setTimestamp()
			.setAuthor({
				name: moderator.user.tag,
				iconURL: moderator.user.avatarURL({ extension: 'png', size: 4096 }) ?? undefined
			})
			.addFields({ name: '**Action**', value: `${'Update Modlog'}` })
			.addFields({ name: '**Moderator**', value: `${moderator} (${moderator.user.tag})` })
			.addFields({ name: '**ModLog Changed**', value: modlogID })
			.addFields({ name: '**Value Changed**', value: key })
			.addFields({ name: '**Old Value**', value: await util.inspectCleanRedactCodeblock(oldModlog, undefined, undefined, 1024) })
			.addFields({ name: '**New Value**', value: await util.inspectCleanRedactCodeblock(newModlog, undefined, undefined, 1024) });

		return await logChannel.send({ embeds: [logEmbed] });
	}
}
