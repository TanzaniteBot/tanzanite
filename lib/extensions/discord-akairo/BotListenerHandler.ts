import { ListenerHandler } from '@notenoughupdates/discord-akairo';
import type readline from 'node:readline';
import { TanzaniteClient } from './TanzaniteClient.js';

export class BotListenerHandler extends ListenerHandler {}

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
