import { BushListener, colors, overflowEmbed, type BushClientEvents } from '#lib';

export default class MassEvidenceListener extends BushListener {
	public constructor() {
		super('massEvidence', {
			emitter: 'client',
			event: 'massEvidence',
			category: 'member-custom'
		});
	}

	public async exec(...[moderator, guild, evidence, lines]: BushClientEvents['massEvidence']) {
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
