import { BushListener, BushUser, Moderation, ModLogType, type BushClientEvents } from '#lib';
import { AuditLogEvent } from 'discord-api-types';
import { Embed, Permissions } from 'discord.js';

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
		if (!member.guild.me) return; // bot was removed from guild
		if (!member.guild.me.permissions.has(Permissions.FLAGS.VIEW_AUDIT_LOG)) {
			return member.guild.error(
				'modlogSyncKick',
				`Could not sync the potential manual kick of ${member.user.tag} to the modlog because I do not have the "View Audit Log" permission.`
			);
		}

		const now = new Date();
		await util.sleep(0.5); // wait for audit log entry

		const logs = (await member.guild.fetchAuditLogs({ type: AuditLogEvent.MemberKick })).entries.filter(
			// @ts-ignore: scuffed typings
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

		const logEmbed = new Embed()
			.setColor(util.colors.discord.RED)
			.setTimestamp()
			.setFooter({ text: `CaseID: ${log.id}` })
			.setAuthor({
				name: member.user.tag,
				iconURL: member.user.avatarURL({ format: 'png', size: 4096 }) ?? undefined
			})
			.addField({ name: '**Action**', value: `${'Manual Kick'}` })
			.addField({ name: '**User**', value: `${member.user} (${member.user.tag})` })
			.addField({ name: '**Moderator**', value: `${first.executor} (${first.executor.tag})` })
			.addField({ name: '**Reason**', value: `${first.reason ? first.reason : '[No Reason Provided]'}` });
		return await logChannel.send({ embeds: [logEmbed] });
	}
}
