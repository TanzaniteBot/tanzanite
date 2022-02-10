import { BushListener, type BushClientEvents } from '#lib';
import { Embed, GuildMember } from 'discord.js';

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

		const logEmbed = new Embed()
			.setColor(util.colors.Yellow)
			.setTimestamp()
			.setFooter({ text: `CaseID: ${caseID}` })
			.setAuthor({ name: user.tag, iconURL: user.avatarURL({ extension: 'png', size: 4096 }) ?? undefined })
			.addField({ name: '**Action**', value: `${duration ? 'Temp Punishment Role' : 'Perm Punishment Role'}` })
			.addField({ name: '**User**', value: `${user} (${user.tag})` })
			.addField({ name: '**Moderator**', value: `${moderator} (${moderator.tag})` })
			.addField({ name: '**Reason**', value: `${reason ? reason : '[No Reason Provided]'}` });
		if (duration) logEmbed.addField({ name: '**Duration**', value: util.humanizeDuration(duration) });
		return await logChannel.send({ embeds: [logEmbed] });
	}
}
