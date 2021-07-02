import { CommandUtil, ParsedComponentData } from 'discord-akairo';
import { Collection, Snowflake } from 'discord.js';
import { BushMessage } from '../discord.js/BushMessage';
import { BushCommand } from './BushCommand';
import { BushCommandHandler } from './BushCommandHandler';

export interface BushParsedComponentData extends ParsedComponentData {
	command?: BushCommand;
}

export class BushCommandUtil extends CommandUtil {
	public declare parsed?: BushParsedComponentData;
	public declare handler: BushCommandHandler;
	public declare message: BushMessage;
	public declare messages?: Collection<Snowflake, BushMessage>;
	public test: string;

	public constructor(handler: BushCommandHandler, message: BushMessage) {
		super(handler, message);
		this.test = 'abc';
	}
}
