import { AllowedMentions, BushCommand, BushMessage, BushSlashMessage, Level } from '@lib';
import { User } from 'discord.js';

export default class SetXpCommand extends BushCommand {
	public constructor() {
		super('setXp', {
			aliases: ['set-xp'],
			category: 'leveling',
			description: {
				content: 'Sets the xp of a user',
				usage: 'set-xp <user> <xp>',
				examples: ['set-xp @Moulberry 69k'] //nice
			},
			args: [
				{
					id: 'user',
					type: 'user',
					prompt: {
						start: 'What user would you like to change the xp of?',
						retry: '{error} Choose a valid user to change the xp of.',
						required: true
					}
				},
				{
					id: 'xp',
					type: 'abbreviatedNumber',
					match: 'restContent',
					prompt: {
						start: 'How much xp should the user have?',
						retry: "{error} Choose a valid number to set the user's xp to.",
						required: true
					}
				}
			],
			slashOptions: [
				{
					name: 'user',
					description: 'What user would you like to change the xp of?',
					type: 'USER',
					required: true
				},
				{
					name: 'xp',
					description: 'How much xp should the user have?',
					type: 'INTEGER',
					required: true
				}
			],
			slash: true,
			channel: 'guild',
			clientPermissions: (m) => util.clientSendAndPermCheck(m),
			userPermissions: ['ADMINISTRATOR']
		});
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		{ user, xp }: { user: User; xp: number }
	): Promise<unknown> {
		if (!message.guild) return await message.util.reply(`${util.emojis.error} This command can only be run in a guild.`);
		if (!user.id) throw new Error('user.id is null');

		if (isNaN(xp)) return await message.util.reply(`${util.emojis.error} Provide a valid number.`);
		if (xp > 2147483647 || xp < 0)
			return await message.util.reply(
				`${util.emojis.error} Provide an positive integer under \`2147483647\` to set the user's xp to.`
			);

		const [levelEntry] = await Level.findOrBuild({
			where: {
				user: user.id,
				guild: message.guild.id
			},
			defaults: {
				user: user.id,
				guild: message.guild.id
			}
		});

		await levelEntry.update({ xp: xp, user: user.id, guild: message.guild.id });
		return await message.util.send({
			content: `Successfully set <@${user.id}>'s xp to \`${levelEntry.xp.toLocaleString()}\` (level \`${Level.convertXpToLevel(
				levelEntry.xp
			).toLocaleString()}\`).`,
			allowedMentions: AllowedMentions.none()
		});
	}
}
