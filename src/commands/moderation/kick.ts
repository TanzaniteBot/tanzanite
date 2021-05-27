import { BushCommand } from '../../lib/extensions/BushCommand';
import { Guild, Modlog, ModlogType } from '../../lib/models';
import { GuildMember, Message } from 'discord.js';
import { ApplicationCommandOptionType } from 'discord-api-types';
import { CommandInteraction } from 'discord.js';

export default class KickCommand extends BushCommand {
	constructor() {
		super('kick', {
			aliases: ['kick'],
			args: [
				{
					id: 'user',
					type: 'member',
					prompt: {
						start: 'What user would you like to kick?',
						retry: 'Invalid response. What user would you like to kick?'
					}
				},
				{
					id: 'reason'
				}
			],
			clientPermissions: ['KICK_MEMBERS'],
			userPermissions: ['KICK_MEMBERS'],
			description: {
				content: 'Kick a member and log it in modlogs',
				usage: 'kick <member> <reason>',
				examples: ['kick @Tyman being cool']
			},
			slashCommandOptions: [
				{
					type: ApplicationCommandOptionType.USER,
					name: 'user',
					description: 'The user to kick',
					required: true
				},
				{
					type: ApplicationCommandOptionType.STRING,
					name: 'reason',
					description: 'The reason to show in modlogs and audit log',
					required: false
				}
			]
		});
	}

	private async *genResponses(
		message: Message | CommandInteraction,
		user: GuildMember,
		reason?: string
	): AsyncIterable<string> {
		let modlogEnry: Modlog;
		// Create guild entry so postgres doesn't get mad when I try and add a modlog entry
		await Guild.findOrCreate({
			where: {
				id: message.guild.id
			},
			defaults: {
				id: message.guild.id
			}
		});
		try {
			modlogEnry = Modlog.build({
				user: user.id,
				guild: message.guild.id,
				moderator:
					message instanceof Message ? message.author.id : message.user.id,
				type: ModlogType.KICK,
				reason
			});
			await modlogEnry.save();
		} catch (e) {
			console.error(e);
			yield 'Error saving to database. Please report this to a developer.';
			return;
		}
		try {
			await user.send(
				`You were kicked in ${message.guild.name} with reason \`${
					reason || 'No reason given'
				}\``
			);
		} catch (e) {
			yield 'Error sending message to user';
		}
		try {
			await user.kick(
				`Kicked by ${
					message instanceof Message ? message.author.tag : message.user.tag
				} with ${reason ? `reason ${reason}` : 'no reason'}`
			);
		} catch {
			yield 'Error kicking :/';
			await modlogEnry.destroy();
			return;
		}
		yield `Kicked <@!${user.id}> with reason \`${
			reason || 'No reason given'
		}\``;
	}

	async exec(
		message: Message,
		{ user, reason }: { user: GuildMember; reason?: string }
	): Promise<void> {
		for await (const response of this.genResponses(message, user, reason)) {
			await message.util.send(response);
		}
	}

	async execSlash(
		message: CommandInteraction,
		{ user, reason }: { user: GuildMember; reason?: string }
	): Promise<void> {
		for await (const response of this.genResponses(message, user, reason)) {
			await message.reply(response);
		}
	}
}
