import { BotListener, colors, Emitter, humanizeDuration, Moderation, ModLogType, sleep, Time, type BotClientEvents } from '#lib';
import { stripIndent } from '#lib/common/tags.js';
import { AuditLogEvent, EmbedBuilder, Events, PermissionFlagsBits } from 'discord.js';

export default class ModlogSyncBanListener extends BotListener {
	public constructor() {
		super('modlogSyncBan', {
			emitter: Emitter.Client,
			event: Events.GuildBanAdd
		});
	}

	public async exec(...[ban]: BotClientEvents[Events.GuildBanAdd]) {
		if (!(await ban.guild.hasFeature('logManualPunishments'))) return;
		if (!ban.guild.members.me) return; // bot was banned
		if (!ban.guild.members.me.permissions.has(PermissionFlagsBits.ViewAuditLog)) {
			return ban.guild.error(
				'modlogSyncBan',
				`Could not sync the manual ban of ${ban.user.tag} to the modlog because I do not have the "View Audit Log" permission.`
			);
		}

		const now = new Date();
		await sleep(500 * Time.Millisecond); // wait for audit log entry

		const logs = (await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd })).entries.filter(
			(entry) => entry.target?.id === ban.user.id
		);

		const first = logs.first();
		if (!first) return;

		if (!first.executor || first.executor.bot) return;

		if (Math.abs(first.createdAt.getTime() - now.getTime()) > Time.Minute) {
			throw new Error(
				stripIndent`
					Time is off by over a minute: ${humanizeDuration(Math.abs(first.createdAt.getTime() - now.getTime()))}.
					guid: ${ban.guild.id}, member: ${ban.user.id}`
			);
		}

		const { log } = await Moderation.createModLogEntry({
			client: this.client,
			type: ModLogType.PermBan,
			user: ban.user,
			moderator: first.executor,
			reason: `[Manual] ${(first.reason ?? '') || 'No reason given'}`,
			guild: ban.guild
		});
		if (!log) throw new Error('Failed to create modlog entry');

		const logChannel = await ban.guild.getLogChannel('moderation');
		if (!logChannel) return;

		const logEmbed = new EmbedBuilder()
			.setColor(colors.Red)
			.setTimestamp()
			.setFooter({ text: `CaseID: ${log.id}` })
			.setAuthor({
				name: ban.user.tag,
				iconURL: ban.user.avatarURL({ extension: 'png', size: 4096 }) ?? undefined
			})
			.addFields(
				{ name: '**Action**', value: 'Manual Ban' },
				{ name: '**User**', value: `${ban.user} (${ban.user.tag})` },
				{ name: '**Moderator**', value: `${first.executor} (${first.executor.tag})` },
				{ name: '**Reason**', value: `${(first.reason ?? '') || '[No Reason Provided]'}` }
			);
		return await logChannel.send({ embeds: [logEmbed] });
	}
}
