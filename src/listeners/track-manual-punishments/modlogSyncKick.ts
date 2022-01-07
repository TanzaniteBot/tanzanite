import { BushListener, BushUser, Moderation, ModLogType, type BushClientEvents } from '#lib';
import { MessageEmbed } from 'discord.js';

export default class ModlogSyncKickListener extends BushListener {
	public constructor() {
		super('modlogSyncKick', {
			emitter: 'client',
			event: 'guildMemberRemove',
			category: 'guild'
		});
	}

	public override async exec(...[member]: BushClientEvents['guildMemberRemove']) {
		if (!(await member.guild.hasFeature('logManualPunishments'))) return;
		if (!member.guild.me!.permissions.has('VIEW_AUDIT_LOG')) {
			return member.guild.error(
				'modlogSyncKick',
				`Could not sync the potential manual kick of ${member.user.tag} to the modlog because I do not have the "View Audit Log" permission.`
			);
		}

		const now = new Date();
		await util.sleep(0.5); // wait for audit log entry

		const logs = (await member.guild.fetchAuditLogs({ type: 'MEMBER_KICK' })).entries.filter(
			(entry) => entry.target?.id === member.user.id
		);

		const first = logs.first();
		if (!first) return;

		if (!first.executor || first.executor?.bot) return;

		if (Math.abs(first.createdAt.getTime() - now.getTime()) > util.time.minutes) {
			console.log(util.humanizeDuration(Math.abs(first.createdAt.getTime() - now.getTime())));
			throw new Error('Time is off by over a minute');
		}

		const { log } = await Moderation.createModLogEntry({
			type: ModLogType.KICK,
			user: member.user,
			moderator: <BushUser>first.executor,
			reason: `[Manual] ${first.reason ? first.reason : 'No reason given'}`,
			guild: member.guild
		});
		if (!log) throw new Error('Failed to create modlog entry');

		const logChannel = await member.guild.getLogChannel('moderation');
		if (!logChannel) return;

		const logEmbed = new MessageEmbed()
			.setColor(util.colors.discord.RED)
			.setTimestamp()
			.setFooter({ text: `CaseID: ${log.id}` })
			.setAuthor({
				name: member.user.tag,
				iconURL: member.user.avatarURL({ dynamic: true, format: 'png', size: 4096 }) ?? undefined
			})
			.addField('**Action**', `${'Manual Kick'}`)
			.addField('**User**', `${member.user} (${member.user.tag})`)
			.addField('**Moderator**', `${first.executor} (${first.executor.tag})`)
			.addField('**Reason**', `${first.reason ? first.reason : '[No Reason Provided]'}`);
		return await logChannel.send({ embeds: [logEmbed] });
	}
}
