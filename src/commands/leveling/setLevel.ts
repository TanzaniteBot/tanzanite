import { AllowedMentions, BotCommand, emojis, Level, type ArgType, type CommandMessage, type SlashMessage } from '#lib';
import { commas } from '#lib/common/tags.js';
import { ApplicationCommandOptionType } from 'discord.js';
import assert from 'node:assert/strict';

export default class SetLevelCommand extends BotCommand {
	public constructor() {
		super('setLevel', {
			aliases: ['set-level'],
			category: 'leveling',
			description: 'Sets the level of a user',
			usage: ['set-level <user> <level>'],
			examples: ['set-level @Moulberry 69'], //nice
			args: [
				{
					id: 'user',
					description: 'The user to set the level of.',
					type: 'user',
					prompt: 'What user would you like to change the level of?',
					retry: '{error} Choose a valid user to change the level of.',
					slashType: ApplicationCommandOptionType.User
				},
				{
					id: 'level',
					description: 'The level to set the user to.',
					type: 'integer',
					prompt: 'What level would you like to set the user to?',
					retry: '{error} Choose a valid level to set the user to.',
					slashType: ApplicationCommandOptionType.Integer
				}
			],
			slash: true,
			channel: 'guild',
			clientPermissions: [],
			userPermissions: ['Administrator']
		});
	}

	public override async exec(
		message: CommandMessage | SlashMessage,
		{ user, level }: { user: ArgType<'user'>; level: ArgType<'integer'> }
	) {
		assert(message.inGuild());
		assert(user.id);

		if (isNaN(level) || !Number.isInteger(level)) {
			return await message.util.reply(`${emojis.error} Provide a valid number to set the user's level to.`);
		}

		if (level > Level.MAX_LEVEL || level < 0) {
			return await message.util.reply(commas`${emojis.error} You cannot set a level higher than **${Level.MAX_LEVEL}**.`);
		}

		const [levelEntry] = await Level.findOrBuild({
			where: {
				user: user.id,
				guild: message.guild.id
			}
		});

		const xp = Level.convertLevelToXp(level);

		await levelEntry.update({ xp, user: user.id, guild: message.guild.id });

		return await message.util.send({
			content: commas`Successfully set level of <@${user.id}> to **${level}** (**${xp}** xp)`,
			allowedMentions: AllowedMentions.none()
		});
	}
}
