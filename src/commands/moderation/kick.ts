import { BotCommand } from '../../lib/extensions/BotCommand';
import { BotMessage } from '../../lib/extensions/BotMessage';
import { Modlog, ModlogType } from '../../lib/types/Models';
import { GuildMember } from 'discord.js';

export default class PrefixCommand extends BotCommand {
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
			userPermissions: ['KICK_MEMBERS']
		});
	}
	async exec(
		message: BotMessage,
		{ user, reason }: { user: GuildMember; reason?: string }
	): Promise<void> {
		let modlogEnry: Modlog;
		try {
			modlogEnry = Modlog.build({
				user: user.id,
				guild: message.guild.id,
				moderator: message.author.id,
				type: ModlogType.KICK,
				reason
			});
			await modlogEnry.save();
		} catch (e) {
			console.error(e);
			await message.util.send(
				'Error saving to database. Please report this to a developer.'
			);
			return;
		}
		try {
			await user.send(
				`You were kicked in ${message.guild.name} with reason \`${
					reason || 'No reason given'
				}\``
			);
		} catch (e) {
			await message.channel.send('Error sending message to user');
		}
		try {
			await user.kick(
				`Kicked by ${message.author.tag} with ${
					reason ? `reason ${reason}` : 'no reason'
				}`
			);
		} catch {
			await message.util.send('Error kicking :/');
			await modlogEnry.destroy();
			return;
		}
		await message.util.send(
			`Kicked <@!${user.id}> with reason \`${reason || 'No reason given'}\``
		);
	}
}
