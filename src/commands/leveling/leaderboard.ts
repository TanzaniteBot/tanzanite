import { BushCommand, BushMessage, BushSlashMessage, Level } from '@lib';
import { MessageEmbed } from 'discord.js';
import { ButtonPaginator } from '../../lib/common/ButtonPaginator';

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
			clientPermissions: (m) => util.clientSendAndPermCheck(m),
			userPermissions: []
		});
	}

	public override async exec(message: BushMessage | BushSlashMessage, args: { page: number }): Promise<unknown> {
		if (!message.guild) return await message.util.reply(`${util.emojis.error} This command can only be run in a server.`);
		if (!(await message.guild.hasFeature('leveling')))
			return await message.util.reply(
				`${util.emojis.error} This command can only be run in servers with the leveling feature enabled.${
					message.member?.permissions.has('MANAGE_GUILD')
						? ` You can toggle features using the \`${
								message.util.isSlash
									? '/'
									: client.config.isDevelopment
									? 'dev '
									: message.util.parsed?.prefix ?? client.config.prefix
						  }features\` command.`
						: ''
				}`
			);

		const ranks = (await Level.findAll({ where: { guild: message.guild.id } })).sort((a, b) => b.xp - a.xp);
		const mappedRanks = ranks.map(
			(val, index) => `\`${index + 1}\` <@${val.user}> - Level ${val.level} (${val.xp.toLocaleString()} xp)`
		);
		const chunked = util.chunk(mappedRanks, 25);
		const embeds = chunked.map((c) =>
			new MessageEmbed().setTitle(`${message.guild!.name}'s Leaderboard`).setDescription(c.join('\n'))
		);
		return await ButtonPaginator.send(message, embeds, undefined, true, args?.page ?? undefined);
	}
}
