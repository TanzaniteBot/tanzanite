import chalk from 'chalk';
import { Message } from 'discord.js';
import { BushListener } from '../../lib/extensions/BushListener';
import { Level } from '../../lib/models';

export default class LevelListener extends BushListener {
	private levelCooldowns: Set<string> = new Set();
	private blacklistedChannels = ['702456294874808330'];
	constructor() {
		super('level', {
			emitter: 'commandHandler',
			event: 'messageInvalid' // Using messageInvalid here so commands don't give xp
		});
	}
	async exec(message: Message): Promise<void> {
		if (message.author.bot) return;
		if (message.util?.parsed?.command) return;
		if (this.levelCooldowns.has(message.author.id)) return;
		if (!this.client.config.dev && message.guild.id != '516977525906341928') return;
		if (this.blacklistedChannels.includes(message.channel.id)) return;
		if (!['DEFAULT', 'REPLY'].includes(message.type)) return; //checks for join messages, slash commands, booster messages etc
		const [user] = await Level.findOrBuild({
			where: {
				id: message.author.id
			},
			defaults: {
				id: message.author.id
			}
		});
		const xpToGive = Level.genRandomizedXp();
		user.xp += xpToGive;
		await user.save();
		await this.client.logger.verbose(chalk`{cyan Gave XP to {green ${message.author.tag}}: {green ${xpToGive}xp}.}`);
		this.levelCooldowns.add(message.author.id);
		setTimeout(() => this.levelCooldowns.delete(message.author.id), 60_000);
	}
}
