import { BushListener, type BushClientEvents } from '#lib';
import { EmbedBuilder, GuildMember } from 'discord.js';

export default class BushKickListener extends BushListener {
	public constructor() {
		super('bushKick', {
			emitter: 'client',
			event: 'bushKick',
			category: 'member-custom'
		});
	}

	public override async exec(...[victim, moderator, guild, reason, caseID, dmSuccess]: BushClientEvents['bushKick']) {
		const logChannel = await guild.getLogChannel('moderation');
		if (!logChannel) return;
		const user = victim instanceof GuildMember ? victim.user : victim;

		const logEmbed = new EmbedBuilder()
			.setColor(util.colors.Red)
			.setTimestamp()
			.setFooter({ text: `CaseID: ${caseID}` })
			.setAuthor({ name: user.tag, iconURL: user.avatarURL({ extension: 'png', size: 4096 }) ?? undefined })
			.addFields([
				{ name: '**Action**', value: `${'Kick'}` },
				{ name: '**User**', value: `${user} (${user.tag})` },
				{ name: '**Moderator**', value: `${moderator} (${moderator.tag})` },
				{ name: '**Reason**', value: `${reason ? reason : '[No Reason Provided]'}` }
			]);
		if (dmSuccess === false) logEmbed.addFields([{ name: '**Additional Info**', value: 'Could not dm user.' }]);
		return await logChannel.send({ embeds: [logEmbed] });
	}
}
