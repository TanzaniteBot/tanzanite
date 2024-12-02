import { ListenerHandler } from '@tanzanite/discord-akairo';
import type readline from 'node:readline';
import type { TanzaniteClient } from './TanzaniteClient.js';

export class BotListenerHandler extends ListenerHandler {
	declare public readonly client: TanzaniteClient;
}

export interface Emitters {
	client: TanzaniteClient;
	commandHandler: TanzaniteClient['commandHandler'];
	inhibitorHandler: TanzaniteClient['inhibitorHandler'];
	listenerHandler: TanzaniteClient['listenerHandler'];
	taskHandler: TanzaniteClient['taskHandler'];
	contextMenuCommandHandler: TanzaniteClient['contextMenuCommandHandler'];
	process: NodeJS.Process;
	stdin: readline.Interface;
	gateway: TanzaniteClient['ws'];
	rest: TanzaniteClient['rest'];
	ws: TanzaniteClient['ws'];
}
