import { BotListener } from '../../extensions/BotListener';
import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import chalk from 'chalk';
import functions from '../../constants/functions';

export default class CommandBlockedListener extends BotListener {
	public constructor() {
		super('commandBlocked', {
			emitter: 'commandHandler',
			event: 'commandBlocked',
			category: 'commands'
		});
	}

	public async exec(message: Message, command: Command, reason: string): Promise<void> {
		const infoPrefix = chalk.bgCyan(`${functions.timeStamp()} [CommandBlocked]`);
		if (this.client.config.verbose) {
			console.info(`${infoPrefix} ${chalk.blueBright(message.author.tag)} tried to run ${chalk.blueBright(message.util.parsed.command)} but was blocked because ${chalk.blueBright(reason)}`);
		}

		switch (reason) {
			case 'owner': {
				await message.util.send(`You must be an owner to run command \`${message.util.parsed.command}\``);
				break;
			}
			case 'superuser': {
				await message.util.send(`You must be a superuser to run command \`${message.util.parsed.command}\``);
				break;
			}
			case 'disabled': {
				await message.util.send(`Command ${command.aliases[0]} is currently disabled.`);
				break;
			}
			case 'channelBlacklist': {
				// message.util.send(`\`${(message.channel as TextChannel).name}\` is a blacklisted channel.`)
				break;
			}
			case 'userBlacklist': {
				await message.util.send(`Command blocked because ${message.author.username} is blacklisted from the bot.`);
				break;
			}
			case 'roleBlacklist': {
				await message.util.send(`Command blocked because ${message.author.username} has a role that is blacklisted from using the bot.`);
				break;
			}
			default: {
				await message.util.send(`Command blocked with reason \`${reason}\``);
			}
		}
	}
}
