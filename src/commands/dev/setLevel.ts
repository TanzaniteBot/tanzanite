import { Message, User } from 'discord.js';
import { SlashCommandOption } from '../../lib/extensions/BushClientUtil';
import { BushCommand } from '../../lib/extensions/BushCommand';
import { BushSlashMessage } from '../../lib/extensions/BushInteractionMessage';
import { Level } from '../../lib/models';
import AllowedMentions from '../../lib/utils/AllowedMentions';

export default class SetLevelCommand extends BushCommand {
	constructor() {
		super('setlevel', {
			aliases: ['setlevel'],
			category: 'dev',
			description: {
				content: 'Sets the level of a user',
				usage: 'setlevel <user> <level>',
				examples: ['setlevel @Moulberry 69'] //nice
			},
			args: [
				{
					id: 'user',
					type: 'user',
					prompt: {
						start: 'What user would you like to change the level of?',
						retry: '{error} Choose a valid user to change the level of.'
					}
				},
				{
					id: 'level',
					type: 'number',
					prompt: {
						start: 'What level would you like to set the user to?',
						retry: '{error} Choose a valid level to set the user to.'
					}
				}
			],
			ownerOnly: true,
			slashOptions: [
				{
					type: 'USER',
					name: 'user',
					description: 'The user to change the level of',
					required: true
				},
				{
					type: 'INTEGER',
					name: 'level',
					description: 'The level to set the user to',
					required: true
				}
			],
			slash: true
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
		await levelEntry.update({ xp: Level.convertLevelToXp(level) });
		return `Successfully set level of <@${user.id}> to \`${level}\` (\`${levelEntry.xp}\` XP)`;
	}

	async exec(message: Message, { user, level }: { user: User; level: number }): Promise<void> {
		await message.util.send({
			content: await this.setLevel(user, level),
			allowedMentions: AllowedMentions.none()
		});
	}

	async execSlash(
		message: BushSlashMessage,
		{ user, level }: { user: SlashCommandOption<void>; level: SlashCommandOption<number> }
	): Promise<void> {
		await message.interaction.reply({
			content: await this.setLevel(user.user, level.value),
			allowedMentions: AllowedMentions.none()
		});
	}
}
