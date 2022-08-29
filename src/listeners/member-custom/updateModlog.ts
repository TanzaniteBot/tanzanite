import { BotListener, colors, TanzaniteEvent, type BotClientEvents } from '#lib';
import { EmbedBuilder } from 'discord.js';

export default class UpdateModlogListener extends BotListener {
	public constructor() {
		super(TanzaniteEvent.UpdateModlog, {
			emitter: 'client',
			event: TanzaniteEvent.UpdateModlog
		});
	}

	public async exec(...[moderator, modlogID, key, oldModlog, newModlog]: BotClientEvents[TanzaniteEvent.UpdateModlog]) {
		const logChannel = await moderator.guild.getLogChannel('moderation');
		if (!logChannel) return;

		const logEmbed = new EmbedBuilder()
			.setColor(colors.Blurple)
			.setTimestamp()
			.setAuthor({
				name: moderator.user.tag,
				iconURL: moderator.user.avatarURL({ extension: 'png', size: 4096 }) ?? undefined
			})
			.addFields(
				{ name: '**Action**', value: 'Update Modlog' },
				{ name: '**Moderator**', value: `${moderator} (${moderator.user.tag})` },
				{ name: '**ModLog Changed**', value: modlogID },
				{ name: '**Value Changed**', value: key },
				{
					name: '**Old Value**',
					value: await this.client.utils.inspectCleanRedactCodeblock(oldModlog, undefined, undefined, 1024)
				},
				{
					name: '**New Value**',
					value: await this.client.utils.inspectCleanRedactCodeblock(newModlog, undefined, undefined, 1024)
				}
			);

		return await logChannel.send({ embeds: [logEmbed] });
	}
}
