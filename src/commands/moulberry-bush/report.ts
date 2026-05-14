import {
	AllowedMentions,
	BotCommand,
	colors,
	emojis,
	mappings,
	timestampAndDelta,
	type ArgType,
	type CommandMessage
} from '#lib';
import { stripIndent } from '#tags';
import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import assert from 'node:assert/strict';

export default class ReportCommand extends BotCommand {
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
					slashType: ApplicationCommandOptionType.User,
					slashResolve: 'Member'
				},
				{
					id: 'evidence',
					description: 'The evidence to report the user for.',
					type: 'string',
					match: 'rest',
					prompt: 'What did the user do wrong?',
					retry: '{error} Provide evidence.',
					optional: true,
					slashType: ApplicationCommandOptionType.String
				}
			],
			slash: true,
			clientPermissions: ['EmbedLinks'],
			clientCheckChannel: true,
			userPermissions: [],
			channel: 'guild'
		});
	}

	public override async exec(message: CommandMessage, { member, evidence }: { member: ArgType<'member'>; evidence: string }) {
		assert(message.inGuild());

		if (!(await message.guild.hasFeature('reporting')))
			return await message.util.reply(`${emojis.error} This command can only be used in servers where reporting is enabled.`);

		if (member == null)
			return await message.util.reply(`${emojis.error} Choose someone to report, ensure the user is in the server.`);
		if (member.user.id === mappings.users['IRONM00N'])
			return await message.util.reply({
				content: `Thank you for your report! We take these allegations very seriously and have reported <@${member.user.id}> to the FBI!`,
				allowedMentions: AllowedMentions.none()
			});

		if (member.user.bot)
			return await message.util.reply(`${emojis.error} You cannot report a bot <:WeirdChamp:756283321301860382>.`);

		const reportChannel = await message.guild.getLogChannel('report');
		if (!reportChannel)
			return await message.util.reply(
				`${emojis.error} This server has not setup a report logging channel or the channel no longer exists.`
			);

		//The formatting of the report is mostly copied from carl since it is pretty good when it actually works
		const reportEmbed = new EmbedBuilder()
			.setFooter({ text: `Reporter ID: ${message.author.id} Reported ID: ${member.user.id}` })
			.setTimestamp()
			.setAuthor({
				name: `Report From: ${message.author.tag}`,
				iconURL: message.author.avatarURL() ?? undefined
			})
			.setTitle('New Report')
			.setColor(colors.red)
			.setDescription(evidence)
			.addFields(
				{
					name: 'Reporter',
					value: stripIndent`
						**Name:**${message.author.tag} <@${message.author.id}>
						**Joined:** $${timestampAndDelta(message.member!.joinedAt!)}
						**Created:** ${timestampAndDelta(message.author.createdAt)}
						**Sent From**: <#${message.channel.id}> [Jump to context](${message.url})`,
					inline: true
				},
				{
					name: 'Reported User',
					value: stripIndent`
						**Name:** ${member.user.tag} <@${member.user.id}>
						**Joined:** ${timestampAndDelta(member.joinedAt!)}
						**Created:** ${timestampAndDelta(member.user.createdAt)}`,
					inline: true
				}
			);

		if (message.attachments.size > 0) {
			const fileName = message.attachments.first()!.name.toLowerCase();
			if (fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.gif') || fileName.endsWith('.webp')) {
				reportEmbed.setImage(message.attachments.first()!.url);
			} else {
				reportEmbed.addFields({ name: 'Attachment', value: message.attachments.first()!.url });
			}
		}
		await reportChannel.send({ embeds: [reportEmbed] }).then(async (ReportMessage) => {
			try {
				await ReportMessage.react(emojis.check);
				await ReportMessage.react(emojis.cross);
			} catch {
				void this.client.console.warn('ReportCommand', 'Could not react to report message.');
			}
		});
		return await message.util.reply('Successfully made a report.');
	}
}
