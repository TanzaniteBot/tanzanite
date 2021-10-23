import { CommandUtil, ParsedComponentData } from 'discord-akairo';
import { Snowflake } from 'discord-api-types';
import { Collection } from 'discord.js';
import { BushMessage } from '../discord.js/BushMessage';
import { BushCommand } from './BushCommand';
import { BushCommandHandler } from './BushCommandHandler';
import { BushSlashMessage } from './BushSlashMessage';

export interface BushParsedComponentData extends ParsedComponentData {
	command?: BushCommand;
}

export class BushCommandUtil<BushMessageType extends BushMessage | BushSlashMessage> extends CommandUtil<BushMessageType> {
	public declare parsed: BushParsedComponentData | null;
	public declare handler: BushCommandHandler;
	public declare message: BushMessageType;
	public declare messages: Collection<Snowflake, BushMessage> | null;

	public constructor(handler: BushCommandHandler, message: BushMessageType) {
		super(handler, message);
	}
}
