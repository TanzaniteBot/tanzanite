import { BushListener, type BushClientEvents } from '#lib';
import { Embed } from 'discord.js';

export default class BushUpdateSettingsListener extends BushListener {
	public constructor() {
		super('bushUpdateSettings', {
			emitter: 'client',
			event: 'bushUpdateSettings',
			category: 'member-custom'
		});
	}

	public override async exec(...[setting, guild, oldSettings, newSettings, moderator]: BushClientEvents['bushUpdateSettings']) {
		const logChannel = await guild.getLogChannel('moderation');
		if (!logChannel) return;

		const logEmbed = new Embed().setColor(util.colors.Blurple).setTimestamp();

		if (moderator)
			logEmbed.setAuthor({
				name: moderator.user.tag,
				iconURL: moderator.user.avatarURL({ extension: 'png', size: 4096 }) ?? undefined
			});
		logEmbed.addFields({ name: '**Action**', value: `${'Update Settings'}` });
		if (moderator) logEmbed.addFields({ name: '**Moderator**', value: `${moderator} (${moderator.user.tag})` });
		logEmbed
			.addFields({ name: '**Setting Changed**', value: setting })
			.addFields({ name: '**Old Value**', value: await util.inspectCleanRedactCodeblock(oldSettings, 'js', undefined, 1024) })
			.addFields({ name: '**New Value**', value: await util.inspectCleanRedactCodeblock(newSettings, 'js', undefined, 1024) });

		return await logChannel.send({ embeds: [logEmbed] });
	}
}
