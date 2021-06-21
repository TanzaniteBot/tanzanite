import { AkairoMessage } from 'discord-akairo';
import { CommandInteraction } from 'discord.js';
import { BushClient } from './BushClient';

export class BushSlashMessage extends AkairoMessage {
	public constructor(
		client: BushClient,
		interaction: CommandInteraction,
		{ slash, replied }: { slash?: boolean; replied?: boolean }
	) {
		super(client, interaction, { slash, replied });
		this.client = client;
		this.interaction = interaction;
	}
}
