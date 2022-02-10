import { BushListener, type BushClientEvents } from '#lib';
import { Embed } from 'discord.js';

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

		const logEmbed = new Embed()
			.setColor(util.colors.Blurple)
			.setTimestamp()
			.setAuthor({
				name: moderator.user.tag,
				iconURL: moderator.user.avatarURL({ extension: 'png', size: 4096 }) ?? undefined
			})
			.addField({ name: '**Action**', value: `${'Update Modlog'}` })
			.addField({ name: '**Moderator**', value: `${moderator} (${moderator.user.tag})` })
			.addField({ name: '**ModLog Changed**', value: modlogID })
			.addField({ name: '**Value Changed**', value: key })
			.addField({ name: '**Old Value**', value: await util.inspectCleanRedactCodeblock(oldModlog, undefined, undefined, 1024) })
			.addField({ name: '**New Value**', value: await util.inspectCleanRedactCodeblock(newModlog, undefined, undefined, 1024) });

		return await logChannel.send({ embeds: [logEmbed] });
	}
}
