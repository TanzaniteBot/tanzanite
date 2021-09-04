import { CommandUtil, ParsedComponentData } from 'discord-akairo';
import { Snowflake } from 'discord-api-types';
import { Collection } from 'discord.js';
import { BushMessage } from '../discord.js/BushMessage';
import { BushCommand } from './BushCommand';
import { BushCommandHandler } from './BushCommandHandler';

export interface BushParsedComponentData extends ParsedComponentData {
	command?: BushCommand;
}

export class BushCommandUtil extends CommandUtil {
	public declare parsed: BushParsedComponentData | null;
	public declare handler: BushCommandHandler;
	public declare message: BushMessage;
	public declare messages: Collection<Snowflake, BushMessage> | null;

	public constructor(handler: BushCommandHandler, message: BushMessage) {
		super(handler, message);
	}
}
