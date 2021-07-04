import { GuildMember, Message } from 'discord.js';
import { BushCommand } from '../../lib/extensions/discord-akairo/BushCommand';
import { Guild, ModLog, ModLogType } from '../../lib/models';

export default class WarnCommand extends BushCommand {
	public constructor() {
		super('warn', {
			aliases: ['warn'],
			category: 'moderation',
			userPermissions: ['MANAGE_MESSAGES'],
			args: [
				{
					id: 'member',
					type: 'member'
				},
				{
					id: 'reason',
					type: 'contentWithDuration',
					match: 'rest'
				}
			],
			description: {
				content: 'Warn a member and log it in modlogs',
				usage: 'warn <member> <reason>',
				examples: ['warn @Tyman being cool']
			}
		});
	}
	public async exec(message: Message, { member, reason }: { member: GuildMember; reason: string }): Promise<unknown> {
		return message.util.reply(`${this.client.util.emojis.error} This command is not finished.`);

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
			const entry = ModLog.build({
				user: member.id,
				guild: message.guild.id,
				moderator: message.author.id,
				type: ModLogType.WARN,
				reason
			});
			await entry.save();
		} catch {
			await message.util.send('Error saving to database, please contact the developers');
			return;
		}
		try {
			await member.send(`You were warned in ${message.guild.name} for reason "${reason}".`);
		} catch {
			await message.util.send('Error messaging user, warning still saved.');
			return;
		}
		await message.util.send(`${member.user.tag} was warned for reason "${reason}".`);
	}
}
