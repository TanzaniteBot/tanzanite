import type { BotCommand, CommandMessage, InhibitorReason, InhibitorType, SlashMessage, TanzaniteClient } from '#lib';
import { Inhibitor, type InhibitorOptions } from '@tanzanite/discord-akairo';
import type { Message } from 'discord.js';

export abstract class BotInhibitor extends Inhibitor {
	public declare readonly client: TanzaniteClient;

	public constructor(id: InhibitorReason, options?: BotInhibitorOptions) {
		super(id, options);
	}

	/**
	 * Checks if message should be blocked.
	 * A return value of true will block the message.
	 * If returning a Promise, a resolved value of true will block the message.
	 *
	 * **Note:** `'all'` type inhibitors do not have {@link Message.util} defined.
	 *
	 * @param message - Message being handled.
	 * @param command - Command to check.
	 */
	public abstract override exec(message: CommandMessage, command: BotCommand): any;
	public abstract override exec(message: CommandMessage | SlashMessage, command: BotCommand): any;
}

/**
 * Options to use for inhibitor execution behavior.
 */
export interface BotInhibitorOptions extends InhibitorOptions {
	/**
	 * Reason emitted when command or message is blocked.
	 * @default ""
	 */
	reason: InhibitorReason;

	/**
	 * - {@link InhibitorType.All} run on all messages
	 * - {@link InhibitorType.Pre} run on messages not blocked by the built-in inhibitors
	 * - {@link InhibitorType.Post} run on messages that are commands
	 */
	type: InhibitorType;

	/**
	 * Priority for the inhibitor for when more than one inhibitors block a message.
	 * The inhibitor with the highest priority is the one that is used for the block reason.
	 * @default 0
	 */
	priority?: number;
}
