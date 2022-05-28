import { BushListener, type BushClientEvents } from '#lib';

export default class MassEvidenceListener extends BushListener {
	public constructor() {
		super('massEvidence', {
			emitter: 'client',
			event: 'massEvidence',
			category: 'member-custom'
		});
	}

	public override async exec(...[moderator, guild, evidence, lines]: BushClientEvents['massEvidence']) {
		const logChannel = await guild.getLogChannel('moderation');
		if (!logChannel) return;

		const embeds = util.overflowEmbed(
			{
				color: util.colors.DarkRed,
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
