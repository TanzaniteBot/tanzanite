import { CommandUtil, ParsedComponentData } from 'discord-akairo';
import { Collection, Snowflake } from 'discord.js';
import { BushCommand, BushCommandHandler, BushMessage } from '..';

export interface BushParsedComponentData extends ParsedComponentData {
	command?: BushCommand;
}

export class BushCommandUtil extends CommandUtil {
	public declare parsed?: BushParsedComponentData;
	public declare handler: BushCommandHandler;
	public declare message: BushMessage;
	public declare messages?: Collection<Snowflake, BushMessage>;
	// public test: string;

	public constructor(handler: BushCommandHandler, message: BushMessage) {
		super(handler, message);
		// this.test = 'abc';
	}
}
