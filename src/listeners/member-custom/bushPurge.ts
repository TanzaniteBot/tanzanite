import { BushListener, type BushClientEvents } from '#lib';
import { Embed } from 'discord.js';

export default class BushPurgeListener extends BushListener {
	public constructor() {
		super('bushPurge', {
			emitter: 'client',
			event: 'bushPurge',
			category: 'member-custom'
		});
	}

	public override async exec(...[moderator, guild, channel, messages]: BushClientEvents['bushPurge']) {
		const logChannel = await guild.getLogChannel('moderation');
		if (!logChannel) return;

		const mappedMessages = messages.map((m) => ({
			id: m.id,
			author: `${m.author.tag} (${m.id})`,
			content: m.content,
			embeds: m.embeds,
			attachments: [...m.attachments.values()]
		}));
		const haste = await util.inspectCleanRedactHaste(mappedMessages);

		const logEmbed = new Embed()
			.setColor(util.colors.discord.DARK_PURPLE)
			.setTimestamp()
			.setFooter({ text: `${messages.size.toLocaleString()} Messages` })
			.setAuthor({ name: moderator.tag, iconURL: moderator.avatarURL({ format: 'png', size: 4096 }) ?? undefined })
			.addField({ name: '**Action**', value: `${'Purge'}` })
			.addField({ name: '**Moderator**', value: `${moderator} (${moderator.tag})` })
			.addField({ name: '**Channel**', value: `<#${channel.id}> (${channel.name})` })
			.addField({
				name: '**Messages**',
				value: `${
					haste.url ? `[haste](${haste.url})${haste.error ? `- ${haste.error}` : ''}` : `${util.emojis.error} ${haste.error}`
				}`
			});
		return await logChannel.send({ embeds: [logEmbed] });
	}
}
