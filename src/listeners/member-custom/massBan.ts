import { BanResponse, banResponse, BushListener, colors, emojis, overflowEmbed, type BushClientEvents } from '#lib';

export default class MassBanListener extends BushListener {
	public constructor() {
		super('massBan', {
			emitter: 'client',
			event: 'massBan',
			category: 'member-custom'
		});
	}

	public async exec(...[moderator, guild, reason, results]: BushClientEvents['massBan']) {
		const logChannel = await guild.getLogChannel('moderation');
		if (!logChannel) return;

		const success = (res: BanResponse): boolean => [banResponse.SUCCESS, banResponse.DM_ERROR].includes(res as any);

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
					{ name: '**Reason**', value: `${reason ? reason : '[No Reason Provided]'}` }
				]
			},
			lines
		);

		return await logChannel.send({ embeds });
	}
}
