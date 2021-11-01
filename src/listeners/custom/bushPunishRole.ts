import { BushListener, type BushClientEvents } from '#lib';
import { GuildMember, MessageEmbed } from 'discord.js';

export default class BushPunishRoleListener extends BushListener {
	public constructor() {
		super('bushPunishRole', {
			emitter: 'client',
			event: 'bushPunishRole',
			category: 'custom'
		});
	}

	public override async exec(...[victim, moderator, guild, reason, caseID, duration]: BushClientEvents['bushPunishRole']) {
		const logChannel = await guild.getLogChannel('moderation');
		if (!logChannel) return;
		const user = victim instanceof GuildMember ? victim.user : victim;

		const logEmbed = new MessageEmbed()
			.setColor(util.colors.discord.YELLOW)
			.setTimestamp()
			.setFooter(`CaseID: ${caseID}`)
			.setAuthor(user.tag, user.avatarURL({ dynamic: true, format: 'png', size: 4096 }) ?? undefined)
			.addField('**Action**', `${duration ? 'Temp Punishment Role' : 'Perm Punishment Role'}`)
			.addField('**User**', `${user} (${user.tag})`)
			.addField('**Moderator**', `${moderator} (${moderator.tag})`)
			// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
			.addField('**Reason**', `${reason || '[No Reason Provided]'}`);
		if (duration) logEmbed.addField('**Duration**', util.humanizeDuration(duration));
		return await logChannel.send({ embeds: [logEmbed] });
	}
}
