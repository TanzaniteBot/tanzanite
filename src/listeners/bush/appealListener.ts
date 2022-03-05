/* eslint-disable no-control-regex */
import { BushListener, ModLog, type BushClientEvents } from '#lib';

export default class AppealListener extends BushListener {
	public constructor() {
		super('appealListener', {
			emitter: 'client',
			event: 'messageCreate',
			category: 'bush'
		});
	}

	public override async exec(...[message]: BushClientEvents['messageCreate']): Promise<void> {
		if (message.author.id !== '855446927688335370' || message.embeds.length < 1) return;
		const userId = message.embeds[0].fields?.find?.((f) => f.name === 'What is your discord ID?')?.value;
		if (!userId) return;
		const thread = await message.startThread({
			name: `${message.embeds[0].fields!.find((f) => f.name === 'What type of punishment are you appealing?')!.value} appeal`
		});
		const user = await this.client.users.fetch(userId).catch(() => null);
		if (!user) {
			await thread.send({
				embeds: [
					this.client.util
						.embed()
						.setTitle(
							`${message.embeds[0].fields!.find((f) => f.name === 'What type of punishment are you appealing?')!.value} appeal`
						)
						.addFields({
							name: 'Author',
							value: 'Unable to fetch author, ID was likely invalid'
						})
				]
			});
		} else {
			const latestModlog = await ModLog.findOne({
				where: {
					user: user.id,
					guild: message.guildId
				},
				order: [['createdAt', 'DESC']]
			});
			await thread.send({
				embeds: [
					this.client.util
						.embed()
						.setTitle(
							`${message.embeds[0].fields!.find((f) => f.name === 'What type of punishment are you appealing?')!.value} appeal`
						)
						.addField({
							name: 'Author',
							value: `${user} (${user.tag})`
						})
						.addField({
							name: 'Latest modlog',
							value: latestModlog
								? `
										Case ID: ${latestModlog.id}
										Moderator: <@${latestModlog.moderator}> (${
										(await this.client.users
											.fetch(latestModlog.moderator)
											.then((u) => u.tag)
											.catch(() => null)) ?? latestModlog.moderator
								  })
										Reason: ${latestModlog.reason}
										Type: ${latestModlog.type}
										Evidence: ${latestModlog.evidence}
									`.replace(/\x09/g, '')
								: 'No modlogs found'
						})
				]
			});
		}
	}
}
