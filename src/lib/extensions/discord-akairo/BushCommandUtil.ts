import { type BushCommand, type BushCommandHandler, type BushMessage, type BushSlashMessage } from '#lib';
import { CommandUtil, type ParsedComponentData } from 'discord-akairo';
import { type Collection, type Snowflake } from 'discord.js';

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
