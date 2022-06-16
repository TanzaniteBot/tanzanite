import { BushListener, colors, emojis, inspectCleanRedactHaste, type BushClientEvents } from '#lib';
import { EmbedBuilder } from 'discord.js';

export default class BushPurgeListener extends BushListener {
	public constructor() {
		super('bushPurge', {
			emitter: 'client',
			event: 'bushPurge',
			category: 'member-custom'
		});
	}

	public async exec(...[moderator, guild, channel, messages]: BushClientEvents['bushPurge']) {
		const logChannel = await guild.getLogChannel('moderation');
		if (!logChannel) return;

		const mappedMessages = messages.map((m) => ({
			id: m.id,
			author: `${m.author.tag} (${m.id})`,
			content: m.content,
			embeds: m.embeds,
			attachments: [...m.attachments.values()]
		}));
		const haste = await inspectCleanRedactHaste(mappedMessages);

		const logEmbed = new EmbedBuilder()
			.setColor(colors.DarkPurple)
			.setTimestamp()
			.setFooter({ text: `${messages.size.toLocaleString()} Messages` })
			.setAuthor({ name: moderator.tag, iconURL: moderator.avatarURL({ extension: 'png', size: 4096 }) ?? undefined })
			.addFields([
				{ name: '**Action**', value: `${'Purge'}` },
				{ name: '**Moderator**', value: `${moderator} (${moderator.tag})` },
				{ name: '**Channel**', value: `<#${channel.id}> (${channel.name})` },
				{
					name: '**Messages**',
					value: `${
						haste.url ? `[haste](${haste.url})${haste.error ? `- ${haste.error}` : ''}` : `${emojis.error} ${haste.error}`
					}`
				}
			]);
		return await logChannel.send({ embeds: [logEmbed] });
	}
}
