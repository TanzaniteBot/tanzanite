import { BushCommand, BushMessage, BushSlashMessage, Level } from '@lib';
import { MessageEmbed } from 'discord.js';

export default class LeaderboardCommand extends BushCommand {
	public constructor() {
		super('leaderboard', {
			aliases: ['leaderboard', 'lb'],
			category: 'leveling',
			description: {
				content: 'Allows you to see the users with the highest levels in the server.',
				usage: 'leaderboard [page]',
				examples: ['leaderboard 5']
			},
			args: [
				{
					id: 'page',
					type: 'integer',
					prompt: {
						start: 'What would you like to set your first argument to be?',
						retry: '{error} Pick a valid argument.',
						optional: true
					}
				}
			],
			slash: true,
			slashOptions: [
				{
					name: 'page',
					description: 'What would you like to set your first argument to be?',
					type: 'INTEGER',
					required: false
				}
			],
			channel: 'guild',
			clientPermissions: ['SEND_MESSAGES'],
			userPermissions: ['SEND_MESSAGES']
		});
	}

	public override async exec(message: BushMessage | BushSlashMessage, args: { page: number }): Promise<unknown> {
		if (!message.guild) return await message.util.reply(`${util.emojis.error} This command can only be run in a server.`);
		const ranks = (await Level.findAll({ where: { guild: message.guild.id } })).sort((a, b) => b.xp - a.xp);
		const mapedRanks = ranks.map(
			(val, index) => `\`${index + 1}\` <@${val.user}> - Level ${val.level} (${val.xp.toLocaleString()} xp)`
		);
		const chunked = util.chunk(mapedRanks, 25);
		const embeds = chunked.map((c) =>
			new MessageEmbed().setTitle(`${message.guild!.name}'s Leaderboard`).setDescription(c.join('\n'))
		);
		return await util.buttonPaginate(message, embeds, null, true, args?.page ?? undefined);
	}
}
