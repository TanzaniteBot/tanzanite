import { BushListener, colors, type BushClientEvents } from '#lib';
import { EmbedBuilder, GuildMember } from 'discord.js';

export default class BushUnbanListener extends BushListener {
	public constructor() {
		super('bushUnban', {
			emitter: 'client',
			event: 'bushUnban',
			category: 'member-custom'
		});
	}

	public async exec(...[victim, moderator, guild, reason, caseID, dmSuccess]: BushClientEvents['bushUnban']) {
		const logChannel = await guild.getLogChannel('moderation');
		if (!logChannel) return;
		const user = victim instanceof GuildMember ? victim.user : victim;

		const logEmbed = new EmbedBuilder()
			.setColor(colors.Green)
			.setTimestamp()
			.setFooter({ text: `CaseID: ${caseID}` })
			.setAuthor({ name: user.tag, iconURL: user.avatarURL({ extension: 'png', size: 4096 }) ?? undefined })
			.addFields([
				{ name: '**Action**', value: `${'Unban'}` },
				{ name: '**User**', value: `${user} (${user.tag})` },
				{ name: '**Moderator**', value: `${moderator} (${moderator.tag})` },
				{ name: '**Reason**', value: `${reason ? reason : '[No Reason Provided]'}` }
			]);
		if (dmSuccess === false) logEmbed.addFields([{ name: '**Additional Info**', value: 'Could not dm user.' }]);
		return await logChannel.send({ embeds: [logEmbed] });
	}
}
