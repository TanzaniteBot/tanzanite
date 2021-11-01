import { BushListener, Level, type BushCommandHandlerEvents, type BushGuild, type BushMessage } from '#lib';
import { type MessageType } from 'discord.js';

export default class LevelListener extends BushListener {
	#levelCooldowns: Set<string> = new Set();
	public constructor() {
		super('level', {
			emitter: 'commandHandler',
			event: 'messageInvalid', // Using messageInvalid here so commands don't give xp
			category: 'message'
		});
	}
	public override async exec(...[message]: BushCommandHandlerEvents['messageInvalid']) {
		if (message.author.bot || !message.author || !message.guild || !message.guildId) return;
		if (this.#levelCooldowns.has(`${message.guildId}-${message.author.id}`)) return;

		if ((await message.guild.getSetting('noXpChannels')).includes(message.channel.id)) return;
		const allowedMessageTypes: MessageType[] = ['DEFAULT', 'REPLY']; // this is so ts will yell at me when discord.js makes some unnecessary breaking change
		if (!allowedMessageTypes.includes(message.type)) return; //checks for join messages, slash commands, booster messages etc
		const [user] = await Level.findOrBuild({
			where: {
				user: message.author.id,
				guild: message.guildId
			},
			defaults: {
				user: message.author.id,
				guild: message.guildId,
				xp: 0
			}
		});
		const previousLevel = Level.convertXpToLevel(user.xp);
		const xpToGive = Level.genRandomizedXp();
		user.xp = user.xp + xpToGive;
		const success = await user.save().catch((e) => {
			void util.handleError('level', e);
			return false;
		});
		const newLevel = Level.convertXpToLevel(user.xp);
		if (previousLevel !== newLevel)
			client.emit(
				'bushLevelUpdate',
				message.member!,
				previousLevel,
				newLevel,
				user.xp,
				message as BushMessage & { guild: BushGuild }
			);
		if (success)
			void client.logger.verbose(`level`, `Gave <<${xpToGive}>> XP to <<${message.author.tag}>> in <<${message.guild}>>.`);
		this.#levelCooldowns.add(`${message.guildId}-${message.author.id}`);
		setTimeout(() => this.#levelCooldowns.delete(`${message.guildId}-${message.author.id}`), 60_000);
	}
}
