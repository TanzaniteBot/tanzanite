import { BushListener, BushUser, Moderation, ModLogType, Time, type BushClientEvents } from '#lib';
import { AuditLogEvent } from 'discord-api-types/v9';
import { Embed, PermissionFlagsBits } from 'discord.js';

export default class ModlogSyncUnbanListener extends BushListener {
	public constructor() {
		super('modlogSyncUnban', {
			emitter: 'client',
			event: 'guildBanRemove',
			category: 'guild'
		});
	}

	public override async exec(...[ban]: BushClientEvents['guildBanRemove']) {
		if (!(await ban.guild.hasFeature('logManualPunishments'))) return;
		if (!ban.guild.me!.permissions.has(PermissionFlagsBits.ViewAuditLog)) {
			return ban.guild.error(
				'modlogSyncBan',
				`Could not sync the manual unban of ${ban.user.tag} to the modlog because I do not have the "View Audit Log" permission.`
			);
		}

		const now = new Date();
		await util.sleep(0.5); // wait for audit log entry

		const logs = (await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanRemove })).entries.filter(
			(entry) => entry.target?.id === ban.user.id
		);

		const first = logs.first();
		if (!first) return;

		if (!first.executor || first.executor?.bot) return;

		if (Math.abs(first.createdAt.getTime() - now.getTime()) > Time.Minute) {
			console.log(util.humanizeDuration(Math.abs(first.createdAt.getTime() - now.getTime())));
			throw new Error('Time is off by over a minute');
		}

		const { log } = await Moderation.createModLogEntry({
			type: ModLogType.UNBAN,
			user: ban.user,
			moderator: <BushUser>first.executor,
			reason: `[Manual] ${first.reason ? first.reason : 'No reason given'}`,
			guild: ban.guild
		});
		if (!log) throw new Error('Failed to create modlog entry');

		const logChannel = await ban.guild.getLogChannel('moderation');
		if (!logChannel) return;

		const logEmbed = new Embed()
			.setColor(util.colors.Orange)
			.setTimestamp()
			.setFooter({ text: `CaseID: ${log.id}` })
			.setAuthor({
				name: ban.user.tag,
				iconURL: ban.user.avatarURL({ extension: 'png', size: 4096 }) ?? undefined
			})
			.addField({ name: '**Action**', value: `${'Manual Unban'}` })
			.addField({ name: '**User**', value: `${ban.user} (${ban.user.tag})` })
			.addField({ name: '**Moderator**', value: `${first.executor} (${first.executor.tag})` })
			.addField({ name: '**Reason**', value: `${first.reason ? first.reason : '[No Reason Provided]'}` });
		return await logChannel.send({ embeds: [logEmbed] });
	}
}
