import { Listener, type ListenerOptions } from '@notenoughupdates/discord-akairo';
import { TanzaniteClient } from './TanzaniteClient.js';

export abstract class BotListener extends Listener {
	public declare readonly client: TanzaniteClient<boolean>;

	public constructor(id: string, options: BotListenerOptions) {
		super(id, options);
	}
}

/**
 * Options to use for listener execution behavior.
 */
export interface BotListenerOptions extends ListenerOptions {
	/**
	 * The event emitter, either a key from `ListenerHandler#emitters` or an EventEmitter.
	 */
	emitter: Emitter;

	/**
	 * Event name to listen to.
	 */
	event: string;

	/**
	 * Type of listener, either 'on' or 'once'.
	 * @default "on"
	 */
	type?: ListenerType;
}

export /* const */ enum Emitter {
	Client = 'client',
	CommandHandler = 'commandHandler',
	InhibitorHandler = 'inhibitorHandler',
	ListenerHandler = 'listenerHandler',
	TaskHandler = 'taskHandler',
	ContextMenuCommandHandler = 'contextMenuCommandHandler',
	Process = 'process',
	Stdin = 'stdin',
	Gateway = 'gateway',
	Rest = 'rest',
	Ws = 'ws'
}

export /* const */ enum ListenerType {
	On = 'on',
	Once = 'once',
	PrependListener = 'prependListener',
	PrependOnceListener = 'prependOnceListener'
}
