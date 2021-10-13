import { BushCommandHandlerEvents, BushGuild, BushListener, BushMessage, Level } from '@lib';
import { MessageType } from 'discord.js';

export default class LevelListener extends BushListener {
	#levelCooldowns: Set<string> = new Set();
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

		if ((await message.guild.getSetting('noXpChannels')).includes(message.channel.id)) return;
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
		this.#levelCooldowns.add(`${message.guild.id}-${message.author.id}`);
		setTimeout(() => this.#levelCooldowns.delete(`${message.guild!.id}-${message.author.id}`), 60_000);
	}
}
