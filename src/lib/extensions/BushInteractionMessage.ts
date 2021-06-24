import { AkairoMessage } from 'discord-akairo';
import { CommandInteraction } from 'discord.js';
import { BushClient } from './BushClient';
import { BushCommandUtil } from './BushCommandUtil';

export class BushSlashMessage extends AkairoMessage {
	public declare client: BushClient;
	public declare util: BushCommandUtil;
	public constructor(
		client: BushClient,
		interaction: CommandInteraction,
		{ slash, replied }: { slash?: boolean; replied?: boolean }
	) {
		super(client, interaction, { slash, replied });
	}
}
