import { ApplicationCommandOptionType } from 'discord-api-types';
import { Message } from 'discord.js';
import { CommandInteraction } from 'discord.js';
import { User } from 'discord.js';
import { BotCommand } from '../../lib/extensions/BotCommand';
import { Level } from '../../lib/models';

export default class LevelCommand extends BotCommand {
	constructor() {
		super('level', {
			aliases: ['level', 'rank'],
			description: {
				content: 'Shows the level of a user',
				usage: 'level [user]',
				examples: ['level', 'level @Tyman']
			},
			args: [
				{
					id: 'user',
					type: 'user',
					prompt: {
						start: 'What user would you like to see the level of?',
						retry:
							'Invalid user. What user would you like to see the level of?',
						optional: true
					}
				}
			],
			slashCommandOptions: [
				{
					type: ApplicationCommandOptionType.USER,
					name: 'user',
					description: 'The user to get the level of',
					required: false
				}
			]
		});
	}

	async exec(message: Message, { user }: { user?: User }): Promise<void> {
		const userLevelRow = await Level.findByPk(
			user ? user.id : message.author.id
		);
		if (userLevelRow) {
			await message.reply(
				`${user ? `${user.tag}'s` : 'Your'} level is ${userLevelRow.level} (${
					userLevelRow.xp
				} XP)`
			);
		} else {
			await message.reply(
				`${user ? `${user.tag} does` : 'You do'} not have a level yet!`
			);
		}
	}
	async execSlash(message: CommandInteraction): Promise<void> {
		const user =
			message.options.find((o) => o.name === 'user')?.user || message.user;
		const userLevelRow = await Level.findByPk(user.id);
		if (userLevelRow) {
			await message.reply(
				`${user.id !== message.user.id ? `${user.tag}'s` : 'Your'} level is ${
					userLevelRow.level
				} (${userLevelRow.xp} XP)`
			);
		} else {
			await message.reply(
				`${
					user.id !== message.user.id ? `${user.tag} does` : 'You do'
				} not have a level yet!`
			);
		}
	}
}
