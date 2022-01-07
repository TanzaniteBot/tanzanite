import { AllowedMentions, BushCommand, type ArgType, type BushMessage } from '#lib';
import assert from 'assert';
import { MessageEmbed } from 'discord.js';
import moment from 'moment';
assert(moment);

export default class ReportCommand extends BushCommand {
	public constructor() {
		super('report', {
			aliases: ['report'],
			category: "Moulberry's Bush",
			description: 'A command to report a user.',
			usage: ['report <user> <reason/evidence>'],
			examples: ['report IRONM00N commands in #general'],
			args: [
				{
					id: 'member',
					description: 'The member to report.',
					type: 'member',
					prompt: 'Who would you like to report?',
					retry: '{error} Choose a valid user to report.',
					slashType: 'USER'
				},
				{
					id: 'evidence',
					description: 'The evidence to report the user for.',
					type: 'string',
					match: 'rest',
					prompt: 'What did the user do wrong?',
					retry: '{error} Provide evidence.',
					optional: true,
					slashType: 'STRING'
				}
			],
			slash: true,
			clientPermissions: (m) => util.clientSendAndPermCheck(m, ['EMBED_LINKS'], true),
			userPermissions: [],
			channel: 'guild'
		});
	}

	public override async exec(message: BushMessage, { member, evidence }: { member: ArgType<'member'>; evidence: string }) {
		if (!message.guild || !(await message.guild.hasFeature('reporting')))
			return await message.util.reply(
				`${util.emojis.error} This command can only be used in servers where reporting is enabled.`
			);

		if (!member) return await message.util.reply(`${util.emojis.error} Choose someone to report`);
		if (member.user.id === '322862723090219008')
			return await message.util.reply({
				content: `Thank you for your report! We take these allegations very seriously and have reported <@${member.user.id}> to the FBI!`,
				allowedMentions: AllowedMentions.none()
			});
		if (member.user.bot)
			return await message.util.reply(`${util.emojis.error} You cannot report a bot <:WeirdChamp:756283321301860382>.`);

		const reportChannel = await message.guild.getLogChannel('report');
		if (!reportChannel)
			return await message.util.reply(
				`${util.emojis.error} This server has not setup a report logging channel or the channel no longer exists.`
			);

		//The formatting of the report is mostly copied from carl since it is pretty good when it actually works
		const reportEmbed = new MessageEmbed()
			.setFooter({ text: `Reporter ID: ${message.author.id} Reported ID: ${member.user.id}` })
			.setTimestamp()
			.setAuthor({
				name: `Report From: ${message.author.tag}`,
				iconURL: message.author.avatarURL({ dynamic: true }) ?? undefined
			})
			.setTitle('New Report')
			.setColor(util.colors.red)
			.setDescription(evidence)
			.addField(
				'Reporter',
				`**Name:**${message.author.tag} <@${message.author.id}>\n**Joined:** ${moment(
					message.member!.joinedTimestamp
				).fromNow()}\n**Created:** ${moment(message.author.createdTimestamp).fromNow()}\n**Sent From**: <#${
					message.channel.id
				}> [Jump to context](${message.url})`,
				true
			)
			.addField(
				'Reported User',
				`**Name:**${member.user.tag} <@${member.user.id}>\n**Joined:** ${moment(
					member.joinedTimestamp
				).fromNow()}\n**Created:** ${moment(member.user.createdTimestamp).fromNow()}`,
				true
			);

		if (message.attachments.size > 0) {
			const fileName = message.attachments.first()!.name!.toLowerCase();
			if (fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.gif') || fileName.endsWith('.webp')) {
				reportEmbed.setImage(message.attachments.first()!.url);
			} else {
				reportEmbed.addField('Attachment', message.attachments.first()!.url);
			}
		}
		await reportChannel.send({ embeds: [reportEmbed] }).then(async (ReportMessage) => {
			try {
				await ReportMessage.react(util.emojis.check);
				await ReportMessage.react(util.emojis.cross);
			} catch {
				void client.console.warn('ReportCommand', 'Could not react to report message.');
			}
		});
		return await message.util.reply('Successfully made a report.');
	}
}
