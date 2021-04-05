import { BushCommand } from '../../lib/extensions/BushCommand';
import { Message, MessageEmbed } from 'discord.js';
import moment from 'moment';
import { TextChannel } from 'discord.js';
import { GuildMember } from 'discord.js';
import log from '../../lib/utils/log';
import AllowedMentions from '../../lib/utils/AllowedMentions';

export default class ReportCommand extends BushCommand {
	public constructor() {
		super('report', {
			aliases: ['report'],
			category: "Moulberry's Bush",
			description: {
				content: 'A command to report a user..',
				usage: 'report <user> <reason/evidence>',
				examples: ['report IRONM00N']
			},
			args: [
				{
					id: 'member',
					type: 'member',
					prompt: {
						start: 'Who would you like to report?',
						retry: '<:no:787549684196704257> Choose a valid user to report.',
						optional: false
					},
					default: undefined
				},
				{
					id: 'evidence',
					type: 'string',
					match: 'rest',
					prompt: {
						start: 'What evidence do you have?',
						retry: '<:no:787549684196704257> Choose a valid user to mention.',
						optional: true
					},
					default: undefined
				}
			],
			clientPermissions: ['EMBED_LINKS', 'SEND_MESSAGES'],
			channel: 'guild'
		});
	}
	public async exec(
		message: Message,
		{ member, evidence }: { member: GuildMember; evidence: string }
	): Promise<unknown> {
		if (message.guild.id != '516977525906341928')
			return message.reply(
				"<:no:787549684196704257> This command can only be run in Moulberry's bush."
			);
		if (!member)
			return message.reply('<:no:787549684196704257> Choose someone to report');
		if (member.user.id === '322862723090219008')
			return message.reply(
				'<:no:787549684196704257> <@322862723090219008> would never do anything wrong 🙂.',
				{ allowedMentions: AllowedMentions.none() }
			);
		if (evidence === null) evidence = 'No Evidence.';
		//todo: Add channel id to db instead of hard coding it & allow in any guild
		//The formatting of the report is mostly copied from carl since it is pretty good when it actually works
		const reportEmbed = new MessageEmbed()
			.setFooter(
				`Reporter ID: ${message.author.id} Reported ID: ${member.user.id}`
			)
			.setTimestamp()
			.setAuthor(
				`Report From: ${message.author.tag}`,
				message.author.avatarURL({ dynamic: true })
			)
			.setTitle('New Report')
			.setColor(this.client.consts.Red)
			.setDescription(evidence)
			.addField(
				'Reporter',
				`**Name:**${message.author.tag} <@${
					message.author.id
				}>\n**Joined:** ${moment(
					message.member.joinedTimestamp
				).fromNow()}\n**Created:** ${moment(
					message.author.createdTimestamp
				).fromNow()}\n**Sent From**: <#${
					message.channel.id
				}> [Jump to context](${message.url})`,
				true
			)
			.addField(
				'Reported User',
				`**Name:**${member.user.tag} <@${member.user.id}>\n**Joined:** ${moment(
					member.joinedTimestamp
				).fromNow()}\n**Created:** ${moment(
					member.user.createdTimestamp
				).fromNow()}`,
				true
			);

		//reusing code pog
		if (message.attachments.size > 0) {
			const fileName = message.attachments.first().name.toLowerCase();
			if (
				fileName.endsWith('.png') ||
				fileName.endsWith('.jpg') ||
				fileName.endsWith('.gif') ||
				fileName.endsWith('.webp')
			) {
				reportEmbed.setImage(message.attachments.first().url);
			} else {
				reportEmbed.addField('Attachment', message.attachments.first().url);
			}
		}
		const reportChannel = <TextChannel>(
			this.client.channels.cache.get('782972723654688848')
		);
		await reportChannel.send(reportEmbed).then(async ReportMessage => {
			try {
				await ReportMessage.react(this.client.consts.yes);
				await ReportMessage.react(this.client.consts.no);
			} catch {
				log.warn('ReportCommand', 'Could not react to report message.');
			}
		});
		message.reply('Successfully made a report.');
		return;
	}
}
