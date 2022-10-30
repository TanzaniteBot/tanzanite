import { AllowedMentions, BotCommand, emojis, Level, type ArgType, type CommandMessage, type SlashMessage } from '#lib';
import { commas } from '#lib/common/tags.js';
import { input } from '#lib/utils/Format.js';
import { ApplicationCommandOptionType } from 'discord.js';
import assert from 'node:assert/strict';

export default class SetXpCommand extends BotCommand {
	public constructor() {
		super('setXp', {
			aliases: ['set-xp'],
			category: 'leveling',
			description: 'Sets the xp of a user',
			usage: ['set-xp <user> <xp>'],
			examples: ['set-xp @Moulberry 69k'], //nice
			args: [
				{
					id: 'user',
					description: 'The user to set the xp of.',
					type: 'user',
					prompt: 'What user would you like to change the xp of?',
					retry: '{error} Choose a valid user to change the xp of.',
					slashType: ApplicationCommandOptionType.User
				},
				{
					id: 'xp',
					description: 'The xp to set the user to.',
					type: 'abbreviatedNumber',
					match: 'restContent',
					prompt: 'How much xp should the user have?',
					retry: "{error} Choose a valid number to set the user's xp to.",
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
		{ user, xp }: { user: ArgType<'user'>; xp: ArgType<'abbreviatedNumber'> }
	) {
		assert(message.inGuild());
		assert(user.id);

		if (isNaN(xp)) return await message.util.reply(`${emojis.error} Provide a valid number.`);

		if (xp > Level.MAX_XP || xp < 0) {
			return await message.util.reply(
				commas`${emojis.error} Provide an positive integer under **${Level.MAX_XP}** to set the user's xp to.`
			);
		}

		const [levelEntry] = await Level.findOrBuild({
			where: {
				user: user.id,
				guild: message.guild.id
			}
		});

		const res = await levelEntry
			.update({ xp: xp, user: user.id, guild: message.guild.id })
			.catch((e) => (e instanceof Error ? e : null));

		xp = levelEntry.xp;
		const level = Level.convertXpToLevel(xp);

		if (res instanceof Error || res == null) {
			return await message.util.reply({
				content: commas`Unable to set <@${user.id}>'s xp to **${xp}** with error ${input(res?.message ?? '¯\\_(ツ)_/¯')}.`,
				allowedMentions: AllowedMentions.none()
			});
		}

		return await message.util.send({
			content: commas`${emojis.success} Successfully set <@${user.id}>'s xp to **${xp}** (level **${level}**).`,
			allowedMentions: AllowedMentions.none()
		});
	}
}
