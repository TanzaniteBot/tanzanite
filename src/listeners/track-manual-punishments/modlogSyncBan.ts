import { BushListener, BushUser, Moderation, ModLogType, type BushClientEvents } from '#lib';
import { AuditLogEvent } from 'discord-api-types';
import { MessageEmbed, Permissions } from 'discord.js';

export default class ModlogSyncBanListener extends BushListener {
	public constructor() {
		super('modlogSyncBan', {
			emitter: 'client',
			event: 'guildBanAdd',
			category: 'guild'
		});
	}

	public override async exec(...[ban]: BushClientEvents['guildBanAdd']) {
		if (!(await ban.guild.hasFeature('logManualPunishments'))) return;
		if (!ban.guild.me) return; // bot was banned
		if (!ban.guild.me.permissions.has(Permissions.FLAGS.VIEW_AUDIT_LOG)) {
			return ban.guild.error(
				'modlogSyncBan',
				`Could not sync the manual ban of ${ban.user.tag} to the modlog because I do not have the "View Audit Log" permission.`
			);
		}

		const now = new Date();
		await util.sleep(0.5); // wait for audit log entry

		const logs = (await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd })).entries.filter(
			// @ts-ignore: scuffed typings
			(entry) => entry.target?.id === ban.user.id
		);

		const first = logs.first();
		if (!first) return;

		if (!first.executor || first.executor?.bot) return;

		if (Math.abs(first.createdAt.getTime() - now.getTime()) > util.time.minutes) {
			console.log(util.humanizeDuration(Math.abs(first.createdAt.getTime() - now.getTime())));
			throw new Error('Time is off by over a minute');
		}

		const { log } = await Moderation.createModLogEntry({
			type: ModLogType.PERM_BAN,
			user: ban.user,
			moderator: <BushUser>first.executor,
			reason: `[Manual] ${first.reason ? first.reason : 'No reason given'}`,
			guild: ban.guild
		});
		if (!log) throw new Error('Failed to create modlog entry');

		const logChannel = await ban.guild.getLogChannel('moderation');
		if (!logChannel) return;

		const logEmbed = new MessageEmbed()
			.setColor(util.colors.discord.RED)
			.setTimestamp()
			.setFooter({ text: `CaseID: ${log.id}` })
			.setAuthor({
				name: ban.user.tag,
				iconURL: ban.user.avatarURL({ format: 'png', size: 4096 }) ?? undefined
			})
			.addField('**Action**', `${'Manual Ban'}`)
			.addField('**User**', `${ban.user} (${ban.user.tag})`)
			.addField('**Moderator**', `${first.executor} (${first.executor.tag})`)
			.addField('**Reason**', `${first.reason ? first.reason : '[No Reason Provided]'}`);
		return await logChannel.send({ embeds: [logEmbed] });
	}
}
