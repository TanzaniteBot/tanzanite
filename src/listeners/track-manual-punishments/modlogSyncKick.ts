import { BotListener, colors, Emitter, humanizeDuration, Moderation, ModLogType, sleep, Time, type BotClientEvents } from '#lib';
import { AuditLogEvent, EmbedBuilder, Events, PermissionFlagsBits } from 'discord.js';

export default class ModlogSyncKickListener extends BotListener {
	public constructor() {
		super('modlogSyncKick', {
			emitter: Emitter.Client,
			event: Events.GuildMemberRemove
		});
	}

	public async exec(...[member]: BotClientEvents[Events.GuildMemberRemove]) {
		if (!(await member.guild.hasFeature('logManualPunishments'))) return;
		if (!member.guild.members.me) return; // bot was removed from guild
		if (!member.guild.members.me.permissions.has(PermissionFlagsBits.ViewAuditLog)) {
			return member.guild.error(
				'modlogSyncKick',
				`Could not sync the potential manual kick of ${member.user.tag} to the modlog because I do not have the "View Audit Log" permission.`
			);
		}

		const now = new Date();
		await sleep(500 * Time.Millisecond); // wait for audit log entry

		const logs = (await member.guild.fetchAuditLogs({ type: AuditLogEvent.MemberKick })).entries.filter(
			(entry) => entry.target?.id === member.user.id
		);

		const first = logs.first();
		if (!first) return;

		if (!first.executor || first.executor?.bot) return;

		if (Math.abs(first.createdAt.getTime() - now.getTime()) > Time.Minute) {
			throw new Error(`Time is off by over a minute: ${humanizeDuration(Math.abs(first.createdAt.getTime() - now.getTime()))}`);
		}

		const { log } = await Moderation.createModLogEntry({
			client: this.client,
			type: ModLogType.KICK,
			user: member.user,
			moderator: first.executor,
			reason: `[Manual] ${first.reason ? first.reason : 'No reason given'}`,
			guild: member.guild
		});
		if (!log) throw new Error('Failed to create modlog entry');

		const logChannel = await member.guild.getLogChannel('moderation');
		if (!logChannel) return;

		const logEmbed = new EmbedBuilder()
			.setColor(colors.Red)
			.setTimestamp()
			.setFooter({ text: `CaseID: ${log.id}` })
			.setAuthor({
				name: member.user.tag,
				iconURL: member.user.avatarURL({ extension: 'png', size: 4096 }) ?? undefined
			})
			.addFields(
				{ name: '**Action**', value: 'Manual Kick' },
				{ name: '**User**', value: `${member.user} (${member.user.tag})` },
				{ name: '**Moderator**', value: `${first.executor} (${first.executor.tag})` },
				{ name: '**Reason**', value: `${first.reason ? first.reason : '[No Reason Provided]'}` }
			);
		return await logChannel.send({ embeds: [logEmbed] });
	}
}
