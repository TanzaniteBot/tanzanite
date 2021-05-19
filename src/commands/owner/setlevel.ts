import { ApplicationCommandOptionType } from 'discord-api-types';
import { CommandInteraction } from 'discord.js';
import { User } from 'discord.js';
import { Message } from 'discord.js';
import { BotCommand } from '../../lib/extensions/BotCommand';
import { SlashCommandOption } from '../../lib/extensions/Util';
import { Level } from '../../lib/models';
import AllowedMentions from '../../lib/utils/AllowedMentions';

export default class SetLevelCommand extends BotCommand {
	constructor() {
		super('setlevel', {
			aliases: ['setlevel'],
			description: {
				content: 'Sets the level of a user',
				usage: 'setlevel <user> <level>',
				examples: ['setlevel @Moulberry 69']
			},
			args: [
				{
					id: 'user',
					type: 'user',
					prompt: {
						start: 'What user would you like to change the level of?',
						retry:
							'Invalid user. What user would you like to change the level of?'
					}
				},
				{
					id: 'level',
					type: 'number',
					prompt: {
						start: 'What level would you like to set?',
						retry: 'Invalid user. What level would you like to set?'
					}
				}
			],
			ownerOnly: true,
			slashCommandOptions: [
				{
					type: ApplicationCommandOptionType.USER,
					name: 'user',
					description: 'The user to change the level of',
					required: true
				},
				{
					type: ApplicationCommandOptionType.INTEGER,
					name: 'level',
					description: 'The level to set the user to',
					required: true
				}
			]
		});
	}

	private async setLevel(user: User, level: number): Promise<string> {
		const [levelEntry] = await Level.findOrBuild({
			where: {
				id: user.id
			},
			defaults: {
				id: user.id
			}
		});
		levelEntry.xp = Level.convertLevelToXp(level);
		await levelEntry.save();
		return `Successfully set level of <@${user.id}> to \`${level}\` (\`${levelEntry.xp}\` XP)`;
	}

	async exec(
		message: Message,
		{ user, level }: { user: User; level: number }
	): Promise<void> {
		await message.util.send(await this.setLevel(user, level), {
			allowedMentions: AllowedMentions.none()
		});
	}

	async execSlash(
		message: CommandInteraction,
		{
			user,
			level
		}: { user: SlashCommandOption<void>; level: SlashCommandOption<number> }
	): Promise<void> {
		await message.reply(await this.setLevel(user.user, level.value), {
			allowedMentions: AllowedMentions.none()
		});
	}
}
