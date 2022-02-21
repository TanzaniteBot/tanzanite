import { BanResponse, banResponse, BushListener, type BushClientEvents } from '#lib';
import { Embed } from 'discord.js';

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

		const logEmbed = new Embed()
			.setColor(util.colors.DarkRed)
			.setTimestamp()
			.setTitle('Mass Ban')
			.addFields(
				{ name: '**Moderator**', value: `${moderator} (${moderator.user.tag})` },
				{ name: '**Reason**', value: `${reason ? reason : '[No Reason Provided]'}` }
			)
			.setDescription(
				results
					.map(
						(reason, user) =>
							`${success(reason) ? util.emojis.success : util.emojis.error} ${user}${success(reason) ? '' : ` - ${reason}`}`
					)
					.join('\n')
			);

		return await logChannel.send({ embeds: [logEmbed] });
	}
}
