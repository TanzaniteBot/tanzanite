import { AllowedMentions, BushCommand, type BushMessage, type BushSlashMessage } from '#lib';
import { EmbedBuilder } from 'discord.js';

export default class SuicideCommand extends BushCommand {
	public constructor() {
		super('suicide', {
			aliases: ['suicide'],
			category: 'utilities',
			description: 'Mental Health Resources. Credit to https://github.com/dexbiobot/Zeppelin.',
			usage: ['suicide'],
			examples: ['suicide'],
			slash: true,
			clientPermissions: (m) => util.clientSendAndPermCheck(m),
			userPermissions: [],
			bypassChannelBlacklist: true
		});
	}

	public override async exec(message: BushMessage | BushSlashMessage) {
		// stolen from https://github.com/dexbiobot/Zeppelin
		const suicideEmbed = new EmbedBuilder()
			.setTitle('Mental Health Resources')
			.setColor(util.colors.red)
			.setAuthor({
				name: 'Remember, You Matter <3',
				iconURL:
					'https://media.discordapp.net/attachments/770256340639416320/854689949193076737/Medical_31-60_974.jpg?width=523&height=523'
			})
			.addFields([
				{
					name: '**National Suicide Prevention Hotline (U.S.):**',
					value: [
						'**Call:** 1-800-273-8255, available 24/7 for emotional support',
						'**Text: HOME** to 741741',
						'https://suicidepreventionlifeline.org/chat/',
						'',
						'**Outside the U.S:** Find a supportive resource on [this Wikipedia list of worldwide crisis hotlines](https://en.wikipedia.org/wiki/List_of_suicide_crisis_lines)'
					].join('\n')
				},
				{
					name: '**More Support**',
					value: [
						'For Substance Abuse Support, Eating Disorder Support & Child Abuse and Domestic Violence:',
						"[Click to go to Discord's Health & Safety Page](https://discord.com/safety/360044103771-Mental-health-on-Discord#h_01EGRGT08QSZ5BNCH2E9HN0NYV)"
					].join('\n')
				}
			]);

		return message.util.send({
			embeds: [suicideEmbed],
			allowedMentions: AllowedMentions.users(),
			// If the original message was a reply -> imitate it
			reply:
				!message.util.isSlashMessage(message) && message.reference?.messageId
					? { messageReference: message.reference.messageId }
					: undefined
		});
	}
}
