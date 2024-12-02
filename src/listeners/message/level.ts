import { BotListener, CommandHandlerEvent, Emitter, Level, TanzaniteEvent, type BotCommandHandlerEvents } from '#lib';
import { MessageType } from 'discord.js';

export default class LevelListener extends BotListener {
	#levelCooldowns: Set<string> = new Set();

	public constructor() {
		super('level', {
			emitter: Emitter.CommandHandler,
			// Using messageInvalid here so commands don't give xp
			event: CommandHandlerEvent.MessageInvalid
		});
	}

	public async exec(...[message]: BotCommandHandlerEvents[CommandHandlerEvent.MessageInvalid]) {
		if (message.author.bot || !message.author || !message.inGuild()) return;
		if (!(await message.guild.hasFeature('leveling'))) return;

		const lock = `${message.guildId}-${message.author.id}`;
		if (this.#levelCooldowns.has(lock)) return;

		if ((await message.guild.getSetting('noXpChannels')).includes(message.channel.id)) return;

		// checks for join messages, slash commands, booster messages etc
		if (![MessageType.Default, MessageType.Reply, MessageType.ThreadStarterMessage].includes(message.type)) {
			return;
		}

		const [levelEntry] = await Level.findOrBuild({
			where: {
				user: message.author.id,
				guild: message.guildId
			}
		});

		const previousLevel = Level.convertXpToLevel(levelEntry.xp);
		const xpToGive = Level.genRandomizedXp();

		let xp = levelEntry.xp + xpToGive;

		if (xp > Level.MAX_XP) {
			xp = Level.MAX_XP;
		}

		const success = await levelEntry.update({ xp, user: message.author.id, guild: message.guild.id }).catch((e: Error) => {
			void this.client.utils.handleError('LevelListener', e);

			return false;
		});

		const newLevel = Level.convertXpToLevel(levelEntry.xp);

		if (success) {
			if (previousLevel !== newLevel) {
				// level up messages and level roles
				this.client.emit(TanzaniteEvent.LevelUpdate, message.member!, previousLevel, newLevel, levelEntry.xp, message);
			}

			void this.client.logger.verbose(`level`, `Gave <<${xpToGive}>> xp to <<${message.author.tag}>> in <<${message.guild}>>.`);
		}

		this.#levelCooldowns.add(lock);

		setTimeout(() => this.#levelCooldowns.delete(lock), 60_000);
	}
}
