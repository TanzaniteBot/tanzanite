import type {
	BushClient,
	BushGuild,
	BushGuildCacheMessage,
	BushGuildMember,
	BushGuildTextBasedChannel,
	BushTextBasedChannel,
	BushUser
} from '#lib';
import type { APIInteractionGuildMember, APIModalSubmitInteraction } from 'discord-api-types/v9';
import {
	InteractionDeferUpdateOptions,
	InteractionUpdateOptions,
	MessagePayload,
	ModalSubmitInteraction,
	type CacheType,
	type CacheTypeReducer
} from 'discord.js';

/**
 * Represents a button interaction.
 */
export class BushModalSubmitInteraction<Cached extends CacheType = CacheType> extends ModalSubmitInteraction<Cached> {
	public declare member: CacheTypeReducer<Cached, BushGuildMember, APIInteractionGuildMember>;
	public declare user: BushUser;

	public constructor(client: BushClient, data: APIModalSubmitInteraction) {
		super(client, data);
	}
}

export interface BushModalSubmitInteraction<Cached extends CacheType = CacheType> extends ModalSubmitInteraction<Cached> {
	get channel(): CacheTypeReducer<
		Cached,
		BushGuildTextBasedChannel | null,
		BushGuildTextBasedChannel | null,
		BushGuildTextBasedChannel | null,
		BushTextBasedChannel | null
	>;
	get guild(): CacheTypeReducer<Cached, BushGuild, null>;
	inGuild(): this is BushModalSubmitInteraction<'raw' | 'cached'>;
	inCachedGuild(): this is BushModalSubmitInteraction<'cached'>;
	inRawGuild(): this is BushModalSubmitInteraction<'raw'>;
	isFromMessage(): this is BushModalMessageModalSubmitInteraction<Cached>;
}

export interface BushModalMessageModalSubmitInteraction<Cached extends CacheType = CacheType>
	extends ModalSubmitInteraction<Cached> {
	/**
	 * The message associated with this interaction
	 */
	message: BushGuildCacheMessage<Cached> | null;

	/**
	 * Updates the original message of the component on which the interaction was received on.
	 * @param options The options for the updated message
	 * @example
	 * // Remove the components from the message
	 * interaction.update({
	 *   content: "A component interaction was received",
	 *   components: []
	 * })
	 *   .then(console.log)
	 *   .catch(console.error);
	 */
	update(options: InteractionUpdateOptions & { fetchReply: true }): Promise<BushGuildCacheMessage<Cached>>;
	update(options: string | MessagePayload | InteractionUpdateOptions): Promise<void>;

	/**
	 * Defers an update to the message to which the component was attached.
	 * @param options Options for deferring the update to this interaction
	 * @example
	 * // Defer updating and reset the component's loading state
	 * interaction.deferUpdate()
	 *   .then(console.log)
	 *   .catch(console.error);
	 */
	deferUpdate(options: InteractionDeferUpdateOptions & { fetchReply: true }): Promise<BushGuildCacheMessage<Cached>>;
	deferUpdate(options?: InteractionDeferUpdateOptions): Promise<void>;

	/**
	 * Indicates whether this interaction is received from a guild.
	 */
	inGuild(): this is BushModalMessageModalSubmitInteraction<'raw' | 'cached'>;

	/**
	 * Indicates whether or not this interaction is both cached and received from a guild.
	 */
	inCachedGuild(): this is BushModalMessageModalSubmitInteraction<'cached'>;

	/**
	 * Indicates whether or not this interaction is received from an uncached guild.
	 */
	inRawGuild(): this is BushModalMessageModalSubmitInteraction<'raw'>;
}
