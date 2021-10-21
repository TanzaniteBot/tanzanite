import { AllowedMentions, BushCommand, BushMessage, BushSlashMessage } from '@lib';
import { MessageEmbed } from 'discord.js';

export default class TemplateCommand extends BushCommand {
	public constructor() {
		super('suicide', {
			aliases: ['suicide'],
			category: 'utilities',
			description: {
				content: 'Mental Health Resources. Credit to https://github.com/dexbiobot/Zeppelin.',
				usage: 'suicide',
				examples: ['suicide']
			},
			slash: true,
			clientPermissions: (m) => util.clientSendAndPermCheck(m),
			userPermissions: [],
			bypassChannelBlacklist: true
		});
	}

	public override async exec(message: BushMessage | BushSlashMessage): Promise<unknown> {
		// stolen from https://github.com/dexbiobot/Zeppelin
		const suicideEmbed = new MessageEmbed()
			.setTitle('Mental Health Resources')
			.setColor(util.colors.red)
			.setAuthor(
				'Remember, You Matter <3',
				'https://media.discordapp.net/attachments/770256340639416320/854689949193076737/Medical_31-60_974.jpg?width=523&height=523'
			)
			.addField(
				'**National Suicide Prevention Hotline (U.S.):**',
				[
					'**Call:** 1-800-273-8255, available 24/7 for emotional support',
					'**Text: HOME** to 741741',
					'https://suicidepreventionlifeline.org/chat/',
					'',
					'**Outside the U.S**: Find a supportive resource on [this Wikipedia list of worldwide crisis hotlines](https://en.wikipedia.org/wiki/List_of_suicide_crisis_lines)'
				].join('\n')
			)
			.addField(
				'**More Support**',
				[
					'For Substance Abuse Support, Eating Disorder Support & Child Abuse and Domestic Violence:',
					"[Click to go to Discord's Health & Safety Page](https://discord.com/safety/360044103771-Mental-health-on-Discord#h_01EGRGT08QSZ5BNCH2E9HN0NYV)"
				].join('\n')
			);

		return (
			// If the original message was a reply -> imitate it
			(message as BushMessage).reference?.messageId && !message.util.isSlash && message.guild && message.channel
				? await message.channel.messages.fetch((message as BushMessage).reference!.messageId!).then(async (message1) => {
						await message1.reply({ embeds: [suicideEmbed], allowedMentions: AllowedMentions.users(), target: message1 });
				  })
				: await message.util.send({ embeds: [suicideEmbed], allowedMentions: AllowedMentions.users() })
		);
	}
}
