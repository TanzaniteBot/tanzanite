import { BanResponse, banResponse, BushListener, type BushClientEvents } from '#lib';

export default class BushBanListener extends BushListener {
	public constructor() {
		super('massBan', {
			emitter: 'client',
			event: 'massBan',
			category: 'member-custom'
		});
	}

	public override async exec(...[moderator, guild, reason, results]: BushClientEvents['massBan']) {
		const logChannel = await guild.getLogChannel('moderation');
		if (!logChannel) return;

		const success = (res: BanResponse): boolean => [banResponse.SUCCESS, banResponse.DM_ERROR].includes(res as any);

		const lines = results.map(
			(reason, user) =>
				`${success(reason) ? util.emojis.success : util.emojis.error} ${user}${success(reason) ? '' : ` - ${reason}`}`
		);

		const embeds = util.overflowEmbed(
			{
				color: util.colors.DarkRed,
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
