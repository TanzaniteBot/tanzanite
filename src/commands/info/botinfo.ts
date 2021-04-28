import { BushCommand } from '../../lib/extensions/BushCommand';
import { Message, MessageEmbed } from 'discord.js';
import child_process from 'child_process';
import { promisify } from 'util';

export default class BotInfoCommand extends BushCommand {
	public constructor() {
		super('botinfo', {
			aliases: ['botinfo'],
			category: 'info',
			ratelimit: 4,
			cooldown: 4000,
			description: {
				content: 'Info About the bot.',
				usage: 'botinfo'
			},
			clientPermissions: ['EMBED_LINKS', 'SEND_MESSAGES']
		});
	}
	public async exec(message: Message): Promise<void> {
		const exec = promisify(child_process.exec);

		const nice_owner_names: Array<string> = [];
		for (const id of this.client.ownerID) {
			nice_owner_names.push((await this.client.users.fetch(id)).tag);
		}

		const CommitNumber = await exec('git rev-parse HEAD');

		const embed: MessageEmbed = new MessageEmbed()
			.setTitle('Bot info')
			.addField('Developers', nice_owner_names, true)
			.addField('Ping', `MSG-creation: **${Date.now() - message.createdTimestamp}ms**\n API-Latency: **${Math.round(this.client.ws.ping)}ms**`, true)
			.addField('Serving', `Serving ${this.client.users.cache.size} users`, true)
			.addField(
				'Commit #',
				`[${CommitNumber.stdout.replace('\n', '').substring(0, 7)}](https://github.com/NotEnoughUpdates/mb-bot-ts/tree/${CommitNumber.stdout.replace('\n', '')})`,
				true
			)
			.addField('Prefix', `\`${message.util.parsed.prefix}\``, true)
			.setFooter(`Client ID • ${message.client.user.id}`);
		await message.util.reply(embed);
	}
}
