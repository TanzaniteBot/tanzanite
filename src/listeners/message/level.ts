import { BushCommandHandlerEvents, BushListener, Level } from '@lib';
import { MessageType } from 'discord.js';

export default class LevelListener extends BushListener {
	#levelCooldowns: Set<string> = new Set();
	#blacklistedChannels = ['702456294874808330'];
	public constructor() {
		super('level', {
			emitter: 'commandHandler',
			event: 'messageInvalid', // Using messageInvalid here so commands don't give xp
			category: 'message'
		});
	}
	public override async exec(...[message]: BushCommandHandlerEvents['messageInvalid']): Promise<void> {
		if (message.author.bot || !message.author || !message.guild) return;
		if (this.#levelCooldowns.has(`${message.guild.id}-${message.author.id}`)) return;
		if (this.#blacklistedChannels.includes(message.channel.id)) return;
		const allowedMessageTypes: MessageType[] = ['DEFAULT', 'REPLY']; // this is so ts will yell at me when discord.js makes some unnecessary breaking change
		if (!allowedMessageTypes.includes(message.type)) return; //checks for join messages, slash commands, booster messages etc
		const [user] = await Level.findOrBuild({
			where: {
				user: message.author.id,
				guild: message.guild.id
			},
			defaults: {
				user: message.author.id,
				guild: message.guild.id,
				xp: 0
			}
		});
		const xpToGive = Level.genRandomizedXp();
		const success = await user.increment('xp', { by: xpToGive }).catch((e) => {
			void client.logger.error('levelMessageListener', e?.stack || e);
			return false;
		});
		if (success)
			void client.logger.verbose(
				`levelMessage`,
				`Gave <<${xpToGive}>> XP to <<${message.author.tag}>> in <<${message.guild}>>.`
			);
		this.#levelCooldowns.add(`${message.guild.id}-${message.author.id}`);
		setTimeout(() => this.#levelCooldowns.delete(`${message.guild!.id}-${message.author.id}`), 60_000);
	}
}
