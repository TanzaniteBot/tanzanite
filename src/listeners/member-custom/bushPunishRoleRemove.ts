import { BushListener, type BushClientEvents } from '#lib';
import { Embed, GuildMember } from 'discord.js';

export default class BushPunishRoleRemoveListener extends BushListener {
	public constructor() {
		super('bushPunishRoleRemove', {
			emitter: 'client',
			event: 'bushPunishRoleRemove',
			category: 'member-custom'
		});
	}

	public override async exec(...[victim, moderator, guild, reason, caseID, role]: BushClientEvents['bushPunishRoleRemove']) {
		const logChannel = await guild.getLogChannel('moderation');
		if (!logChannel) return;
		const user = victim instanceof GuildMember ? victim.user : victim;

		const logEmbed = new Embed()
			.setColor(util.colors.GREEN)
			.setTimestamp()
			.setFooter({ text: `CaseID: ${caseID}` })
			.setAuthor({ name: user.tag, iconURL: user.avatarURL({ format: 'png', size: 4096 }) ?? undefined })
			.addField({ name: '**Action**', value: `${'Remove Punishment Role'}` })
			.addField({ name: '**Role**', value: `${role}` })
			.addField({ name: '**User**', value: `${user} (${user.tag})` })
			.addField({ name: '**Moderator**', value: `${moderator} (${moderator.tag})` })
			.addField({ name: '**Reason**', value: `${reason ? reason : '[No Reason Provided]'}` });

		return await logChannel.send({ embeds: [logEmbed] });
	}
}
