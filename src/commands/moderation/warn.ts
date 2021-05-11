import { GuildMember } from 'discord.js';
import { BotCommand } from '../../lib/extensions/BotCommand';
import { BotMessage } from '../../lib/extensions/BotMessage';
import { Modlog, ModlogType } from '../../lib/types/Models';

export default class WarnCommand extends BotCommand {
	public constructor() {
		super('warn', {
			aliases: ['warn'],
			userPermissions: ['MANAGE_MESSAGES'],
			args: [
				{
					id: 'member',
					type: 'member'
				},
				{
					id: 'reason',
					match: 'rest'
				}
			]
		});
	}
	public async exec(
		message: BotMessage,
		{ member, reason }: { member: GuildMember; reason: string }
	): Promise<void> {
		try {
			const entry = Modlog.build({
				user: member.id,
				guild: message.guild.id,
				moderator: message.author.id,
				type: ModlogType.WARN,
				reason
			});
			await entry.save();
		} catch (e) {
			await message.util.send(
				'Error saving to database, please contact the developers'
			);
			return;
		}
		try {
			await member.send(
				`You were warned in ${message.guild.name} for reason "${reason}".`
			);
		} catch (e) {
			await message.util.send('Error messaging user, warning still saved.');
			return;
		}
		await message.util.send(
			`${member.user.tag} was warned for reason "${reason}".`
		);
	}
}
