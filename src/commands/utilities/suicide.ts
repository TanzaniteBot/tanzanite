import { AllowedMentions, BotCommand, colors, type CommandMessage, type SlashMessage } from '#lib';
import { stripIndent } from '#tags';
import { EmbedBuilder, MessageReferenceType } from 'discord.js';

export default class SuicideCommand extends BotCommand {
	public constructor() {
		super('suicide', {
			aliases: ['suicide'],
			category: 'utilities',
			description: 'Mental Health Resources. Credit to https://github.com/dexbiobot/Zeppelin.',
			usage: ['suicide'],
			examples: ['suicide'],
			slash: true,
			clientPermissions: ['EmbedLinks'],
			clientCheckChannel: true,
			userPermissions: [],
			bypassChannelBlacklist: true
		});
	}

	public override async exec(message: CommandMessage | SlashMessage) {
		// stolen from https://github.com/dexbiobot/Zeppelin
		const suicideEmbed = new EmbedBuilder()
			.setTitle('Mental Health Resources')
			.setColor(colors.red)
			.setAuthor({
				name: 'Remember, You Matter <3',
				iconURL:
					'https://media.discordapp.net/attachments/770256340639416320/854689949193076737/Medical_31-60_974.jpg?width=523&height=523'
			})
			.addFields(
				{
					name: '**National Suicide Prevention Hotline (U.S.):**',
					value: stripIndent`
						**Call:** 1-800-273-8255, available 24/7 for emotional support
						**Text: HOME** to 741741
						https://suicidepreventionlifeline.org/chat/
						
						**Outside the U.S:** Find a supportive resource on [this Wikipedia list of worldwide crisis hotlines](https://en.wikipedia.org/wiki/List_of_suicide_crisis_lines)`
				},
				{
					name: '**More Support**',
					value: stripIndent`
						For Substance Abuse Support, Eating Disorder Support & Child Abuse and Domestic Violence:
						[Click to go to Discord's Health & Safety Page](https://discord.com/safety/360044103771-Mental-health-on-Discord#h_01EGRGT08QSZ5BNCH2E9HN0NYV)`
				}
			);

		return message.util.send({
			embeds: [suicideEmbed],
			allowedMentions: AllowedMentions.users(),
			// If the original message was a reply -> imitate it
			messageReference:
				!message.util.isSlashMessage(message) && message.reference?.messageId
					? {
							messageId: message.reference.messageId,
							channelId: message.reference.channelId,
							guildId: message.reference.guildId,
							type: MessageReferenceType.Default
						}
					: undefined
		});
	}
}
