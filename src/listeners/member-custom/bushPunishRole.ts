import { BushListener, type BushClientEvents } from '#lib';
import { EmbedBuilder, GuildMember } from 'discord.js';

export default class BushPunishRoleListener extends BushListener {
	public constructor() {
		super('bushPunishRole', {
			emitter: 'client',
			event: 'bushPunishRole',
			category: 'member-custom'
		});
	}

	public override async exec(...[victim, moderator, guild, reason, caseID, duration]: BushClientEvents['bushPunishRole']) {
		const logChannel = await guild.getLogChannel('moderation');
		if (!logChannel) return;
		const user = victim instanceof GuildMember ? victim.user : victim;

		const logEmbed = new EmbedBuilder()
			.setColor(util.colors.Yellow)
			.setTimestamp()
			.setFooter({ text: `CaseID: ${caseID}` })
			.setAuthor({ name: user.tag, iconURL: user.avatarURL({ extension: 'png', size: 4096 }) ?? undefined })
			.addFields({ name: '**Action**', value: `${duration ? 'Temp Punishment Role' : 'Perm Punishment Role'}` })
			.addFields({ name: '**User**', value: `${user} (${user.tag})` })
			.addFields({ name: '**Moderator**', value: `${moderator} (${moderator.tag})` })
			.addFields({ name: '**Reason**', value: `${reason ? reason : '[No Reason Provided]'}` });
		if (duration) logEmbed.addFields({ name: '**Duration**', value: util.humanizeDuration(duration) });
		return await logChannel.send({ embeds: [logEmbed] });
	}
}
