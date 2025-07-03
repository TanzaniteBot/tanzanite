import {
	BotListener,
	Emitter,
	TanzaniteEvent,
	banResponse,
	colors,
	emojis,
	overflowEmbed,
	type BanResponse,
	type BotClientEvents
} from '#lib';

export default class MassBanListener extends BotListener {
	public constructor() {
		super(TanzaniteEvent.MassBan, {
			emitter: Emitter.Client,
			event: TanzaniteEvent.MassBan
		});
	}

	public async exec(...[moderator, guild, reason, results]: BotClientEvents[TanzaniteEvent.MassBan]) {
		const logChannel = await guild.getLogChannel('moderation');
		if (!logChannel) return;

		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		const success = (res: BanResponse): boolean => [banResponse.Success, banResponse.DmError].includes(res as any);

		const lines = results.map(
			(reason, user) => `${success(reason) ? emojis.success : emojis.error} ${user}${success(reason) ? '' : ` - ${reason}`}`
		);

		const embeds = overflowEmbed(
			{
				color: colors.DarkRed,
				title: 'Mass Ban',
				timestamp: new Date().toISOString(),
				fields: [
					{ name: '**Moderator**', value: `${moderator} (${moderator.user.tag})` },
					{ name: '**Reason**', value: `${(reason ?? '') || '[No Reason Provided]'}` }
				]
			},
			lines
		);

		return await logChannel.send({ embeds });
	}
}
