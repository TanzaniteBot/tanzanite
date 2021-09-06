import { BushListener } from '@lib';
import { MessageEmbed } from 'discord.js';
import { BushClientEvents } from '../../lib/extensions/discord.js/BushClientEvents';

export default class BushPurgeListener extends BushListener {
	public constructor() {
		super('bushPurge', {
			emitter: 'client',
			event: 'bushPurge',
			category: 'custom'
		});
	}

	public override async exec(...[moderator, guild, channel, messages]: BushClientEvents['bushPurge']): Promise<unknown> {
		const logChannel = await guild.getLogChannel('moderation');
		if (!logChannel) return;

		const mappedMessages = messages.map((m) => ({
			id: m.id,
			author: `${m.author.tag} (${m.id})`,
			content: m.content,
			embeds: m.embeds,
			attachments: m.attachments
		}));
		const haste = await util.inspectCleanRedactHaste(mappedMessages);

		const logEmbed = new MessageEmbed()
			.setColor(util.colors.discord.DARK_PURPLE)
			.setTimestamp()
			.setFooter(`${messages.size.toLocaleString()} Messages`)
			.addField('**Action**', `${'Purge'}`, true)
			.addField('**Moderator**', `${moderator} (${moderator.tag})`, true)
			.addField('**Channel**', `<#${channel.id}> (${channel.name})`, true)
			.addField(
				'**Messages**',
				`${
					haste.url ? `[haste](${haste.url})${haste.error ? `- ${haste.error}` : ''}` : `${util.emojis.error} ${haste.error}`
				}`,
				true
			);
		return await logChannel.send({ embeds: [logEmbed] });
	}
}
