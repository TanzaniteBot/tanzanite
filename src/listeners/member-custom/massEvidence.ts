import { BotListener, colors, Emitter, overflowEmbed, TanzaniteEvent, type BotClientEvents } from '#lib';

export default class MassEvidenceListener extends BotListener {
	public constructor() {
		super(TanzaniteEvent.MassEvidence, {
			emitter: Emitter.Client,
			event: TanzaniteEvent.MassEvidence
		});
	}

	public async exec(...[moderator, guild, evidence, lines]: BotClientEvents[TanzaniteEvent.MassEvidence]) {
		const logChannel = await guild.getLogChannel('moderation');
		if (!logChannel) return;

		const embeds = overflowEmbed(
			{
				color: colors.DarkRed,
				title: 'Mass Evidence',
				timestamp: new Date().toISOString(),
				fields: [
					{ name: '**Moderator**', value: `${moderator} (${moderator.user.tag})` },
					{ name: '**Evidence**', value: `${evidence}` }
				]
			},
			lines
		);

		return await logChannel.send({ embeds });
	}
}
