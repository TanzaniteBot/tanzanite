import { Constants } from 'discord-akairo';
import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import moment from 'moment';
import { AllowedMentions, BushCommand, BushMessage } from '../../lib';

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
					type: Constants.ArgumentTypes.MEMBER,
					match: Constants.ArgumentMatches.PHRASE,
					prompt: {
						start: 'Who would you like to report?',
						retry: `{error} Choose a valid user to report.`,
						optional: false
					}
				},
				{
					id: 'evidence',
					type: Constants.ArgumentTypes.STRING,
					match: Constants.ArgumentMatches.REST,
					prompt: {
						start: 'What evidence do you have?',
						retry: `{error} Provide what did they do wrong.`,
						optional: true
					}
				}
			],
			clientPermissions: ['EMBED_LINKS', 'SEND_MESSAGES'],
			channel: 'guild',
			restrictedGuilds: ['516977525906341928'],
			slash: true,
			slashOptions: [
				{
					name: 'user',
					description: 'The user you would like to report.',
					type: 'USER',
					required: true
				},
				{
					name: 'evidence',
					description: 'What did the user do wrong?',
					type: 'STRING',
					required: false
				}
			],
			slashGuilds: ['516977525906341928']
		});
	}

	public async exec(message: BushMessage, { member, evidence }: { member: GuildMember; evidence: string }): Promise<unknown> {
		if (message.guild.id != this.client.consts.mappings.guilds.bush)
			return await message.util.reply(`${this.client.util.emojis.error} This command can only be run in Moulberry's bush.`);
		if (!member) return await message.util.reply(`${this.client.util.emojis.error} Choose someone to report`);
		if (member.user.id === '322862723090219008')
			return await message.util.reply({
				content: `Thank you for your report! We take these allegations very seriously and have reported <@${member.user.id}> to the FBI!`,
				allowedMentions: AllowedMentions.none()
			});
		if (member.user.bot)
			return await message.util.reply(
				`${this.client.util.emojis.error} You cannot report a bot <:WeirdChamp:756283321301860382>.`
			);

		//// if (!evidence) evidence = 'No Evidence.';
		//todo: Add channel id to db instead of hard coding it & allow in any guild
		//The formatting of the report is mostly copied from carl since it is pretty good when it actually works
		const reportEmbed = new MessageEmbed()
			.setFooter(`Reporter ID: ${message.author.id} Reported ID: ${member.user.id}`)
			.setTimestamp()
			.setAuthor(`Report From: ${message.author.tag}`, message.author.avatarURL({ dynamic: true }))
			.setTitle('New Report')
			.setColor(this.client.util.colors.red)
			.setDescription(evidence)
			.addField(
				'Reporter',
				`**Name:**${message.author.tag} <@${message.author.id}>\n**Joined:** ${moment(
					message.member.joinedTimestamp
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

		//reusing code pog
		if (message.attachments.size > 0) {
			const fileName = message.attachments.first().name.toLowerCase();
			if (fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.gif') || fileName.endsWith('.webp')) {
				reportEmbed.setImage(message.attachments.first().url);
			} else {
				reportEmbed.addField('Attachment', message.attachments.first().url);
			}
		}
		const reportChannel = <TextChannel>this.client.channels.cache.get('782972723654688848');
		await reportChannel.send({ embeds: [reportEmbed] }).then(async (ReportMessage) => {
			try {
				await ReportMessage.react(this.client.util.emojis.success);
				await ReportMessage.react(this.client.util.emojis.error);
			} catch {
				this.client.console.warn('ReportCommand', 'Could not react to report message.');
			}
		});
		return await message.util.reply('Successfully made a report.');
	}
}
