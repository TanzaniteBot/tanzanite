import { ApplicationCommandOptionType } from 'discord-api-types';
import { Message } from 'discord.js';
import { CommandInteractionOption } from 'discord.js';
import { CommandInteraction } from 'discord.js';
import { User } from 'discord.js';
import { BushCommand } from '../../lib/extensions/BushCommand';
import { Level } from '../../lib/models';

export default class LevelCommand extends BushCommand {
	constructor() {
		super('level', {
			aliases: ['level', 'rank'],
			category: "Moulberry's Bush",
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
						retry: 'Invalid user. What user would you like to see the level of?',
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

	private async getResponse(user: User): Promise<string> {
		const userLevelRow = await Level.findByPk(user.id);
		if (userLevelRow) {
			return `${user ? `${user.tag}'s` : 'Your'} level is ${userLevelRow.level} (${userLevelRow.xp} XP)`;
		} else {
			return `${user ? `${user.tag} does` : 'You do'} not have a level yet!`;
		}
	}

	async exec(message: Message, { user }: { user?: User }): Promise<void> {
		await message.reply(await this.getResponse(user || message.author));
	}
	async execSlash(message: CommandInteraction, { user }: { user?: CommandInteractionOption }): Promise<void> {
		await message.reply(await this.getResponse(user?.user || message.user));
	}
}
