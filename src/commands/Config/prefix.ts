import { Command } from 'discord-akairo';

class PrefixCommand extends Command {
	constructor() {
		super('prefix', {
			aliases: ['prefix'],
			category: 'config',
			args: [
				{
					id: 'prefix',
					default: '-'
				}
			],
			channel: 'guild'
		});
	}

	async exec(message, args) {
		// The third param is the default.
		const oldPrefix = this.client.settings.get(message.guild.id, 'prefix', '!');

		await this.client.settings.set(message.guild.id, 'prefix', args.prefix);
		return message.reply(`Prefix changed from ${oldPrefix} to ${args.prefix}`);
	}
}

module.exports = PrefixCommand;