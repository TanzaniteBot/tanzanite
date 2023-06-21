import { Automod, BotListener, Emitter, Severity, Time, colors, regex, type BotClientEvents } from '#lib';
import { stripIndent } from '#lib/common/tags.js';
import assert from 'assert/strict';
import { AutoModerationActionType, Events } from 'discord.js';

export default class NativeAutomodSyncListener extends BotListener {
	public constructor() {
		super('nativeAutomodSync', {
			emitter: Emitter.Client,
			event: Events.AutoModerationActionExecution
		});
	}

	public async exec(...[autoModerationActionExecution]: BotClientEvents[Events.AutoModerationActionExecution]) {
		const { guild } = autoModerationActionExecution;

		// event will fire multiple times, we only care if a message was blocked
		if (autoModerationActionExecution.action.type !== AutoModerationActionType.BlockMessage) return;

		if (!(await guild.hasFeature('automod'))) return;
		if (!this.client.config.isProduction) return;

		const automodRule =
			autoModerationActionExecution.autoModerationRule ??
			(await guild.autoModerationRules.fetch(autoModerationActionExecution.ruleId));

		if (!automodRule)
			throw new Error(`Cannot find automod rule with id ${autoModerationActionExecution.ruleId} in guild ${guild.id}`, {
				cause: autoModerationActionExecution
			});

		const { name: automodName } = automodRule;

		const parsed = regex.nativeAutomodSyncName.exec(automodName);

		if (parsed == null || parsed.groups == null) return;

		const actionLevel = parseInt(parsed.groups.actionLevel) as Severity;
		const ruleName = parsed.groups.ruleName || null;

		const offender = autoModerationActionExecution.member;
		assert(offender);

		const reason = ruleName ?? 'No reason provided';
		const userId = offender.user.id;

		const components = Automod.prototype['buttons'].call(null, userId, reason, actionLevel > 1);

		let title, color;
		switch (actionLevel) {
			case Severity.DELETE:
				// native automod already prevents message from being sent
				return;
			case Severity.WARN:
				void offender.customWarn({
					moderator: guild.members.me!,
					reason: `[Automod] ${reason}`
				});

				title = 'Automod Sync - Warn';
				color = colors.yellow;
				break;
			case Severity.TEMP_MUTE:
				void offender.customMute({
					moderator: guild.members.me!,
					reason: `[Automod] ${reason}`,
					duration: 15 * Time.Minute
				});

				title = 'Automod Sync - Temp Mute';
				color = colors.orange;
				break;
			case Severity.PERM_MUTE:
				void offender.customMute({
					moderator: guild.members.me!,
					reason: `[Automod] ${reason}`,
					duration: 0 // permanent
				});

				title = 'Automod Sync - Perm Mute';
				color = colors.red;
				break;
			default:
				throw new Error(`Unknown severity: ${actionLevel}`);
		}
		void guild.sendLogEmbeds(
			'automod',
			{
				title,
				author: { name: offender.user.tag, icon_url: offender.user.displayAvatarURL() },
				description: stripIndent`
				**User:** ${offender.user} (${offender.user.tag})
				**Rule:** ${ruleName ?? 'no name'}`,
				timestamp: new Date().toISOString(),
				footer: { text: `ID: ${offender.user.id}` },
				color
			},
			components
		);
	}
}
