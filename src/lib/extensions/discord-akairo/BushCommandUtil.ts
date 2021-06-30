import { CommandUtil, ParsedComponentData } from 'discord-akairo';
import { BushCommand } from './BushCommand';

export interface BushParsedComponentData extends ParsedComponentData {
	command?: BushCommand;
}

export class BushCommandUtil extends CommandUtil {
	declare parsed?: BushParsedComponentData;
}
