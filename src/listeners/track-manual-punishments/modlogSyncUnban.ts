import { BotListener, colors, Emitter, humanizeDuration, Moderation, ModLogType, sleep, Time, type BotClientEvents } from '#lib';
import { AuditLogEvent, EmbedBuilder, Events, PermissionFlagsBits } from 'discord.js';

export default class ModlogSyncUnbanListener extends BotListener {
	public constructor() {
		super('modlogSyncUnban', {
			emitter: Emitter.Client,
			event: Events.GuildBanRemove
		});
	}

	public async exec(...[ban]: BotClientEvents[Events.GuildBanRemove]) {
		if (!(await ban.guild.hasFeature('logManualPunishments'))) return;
		if (!ban.guild.members.me!.permissions.has(PermissionFlagsBits.ViewAuditLog)) {
			return ban.guild.error(
				'modlogSyncBan',
				`Could not sync the manual unban of ${ban.user.tag} to the modlog because I do not have the "View Audit Log" permission.`
			);
		}

		const now = new Date();
		await sleep(500 * Time.Millisecond); // wait for audit log entry

		const logs = (await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanRemove })).entries.filter(
			(entry) => entry.target?.id === ban.user.id
		);

		const first = logs.first();
		if (!first) return;

		if (!first.executor || first.executor?.bot) return;

		if (Math.abs(first.createdAt.getTime() - now.getTime()) > Time.Minute) {
			throw new Error(`Time is off by over a minute: ${humanizeDuration(Math.abs(first.createdAt.getTime() - now.getTime()))}`);
		}

		const { log } = await Moderation.createModLogEntry({
			client: this.client,
			type: ModLogType.UNBAN,
			user: ban.user,
			moderator: first.executor,
			reason: `[Manual] ${first.reason ? first.reason : 'No reason given'}`,
			guild: ban.guild
		});
		if (!log) throw new Error('Failed to create modlog entry');

		const logChannel = await ban.guild.getLogChannel('moderation');
		if (!logChannel) return;

		const logEmbed = new EmbedBuilder()
			.setColor(colors.Orange)
			.setTimestamp()
			.setFooter({ text: `CaseID: ${log.id}` })
			.setAuthor({
				name: ban.user.tag,
				iconURL: ban.user.avatarURL({ extension: 'png', size: 4096 }) ?? undefined
			})
			.addFields(
				{ name: '**Action**', value: 'Manual Unban' },
				{ name: '**User**', value: `${ban.user} (${ban.user.tag})` },
				{ name: '**Moderator**', value: `${first.executor} (${first.executor.tag})` },
				{ name: '**Reason**', value: `${first.reason ? first.reason : '[No Reason Provided]'}` }
			);
		return await logChannel.send({ embeds: [logEmbed] });
	}
}
