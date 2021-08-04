import { BushCommand, BushMessage, BushSlashMessage } from '@lib';

export default class EvidenceCommand extends BushCommand {
	public constructor() {
		super('evidence', {
			aliases: ['evidence'],
			category: 'moderation',
			description: {
				content: 'Add evidence to a modlog case.',
				usage: 'evidence <caseID> <evidence>',
				examples: ['evidence ']
			},
			args: [
				{
					id: 'required_argument',
					type: 'string',
					prompt: {
						start: 'What would you like to set your first argument to be?',
						retry: '{error} Pick a valid argument.',
						optional: false
					}
				},
				{
					id: 'optional_argument',
					type: 'string',
					prompt: {
						start: 'What would you like to set your second argument to be?',
						retry: '{error} Pick a valid argument.',
						optional: true
					}
				}
			],
			slash: true,
			slashOptions: [
				{
					name: 'required_argument',
					description: 'What would you like to set your first argument to be?',
					type: 'STRING',
					required: true
				},
				{
					name: 'optional_argument',
					description: 'What would you like to set your second argument to be?',
					type: 'STRING',
					required: false
				}
			],
			superUserOnly: true,
			ownerOnly: true,
			channel: 'guild',
			hidden: true,
			clientPermissions: ['SEND_MESSAGES'],
			userPermissions: ['SEND_MESSAGES']
		});
	}

	public override async exec(message: BushMessage | BushSlashMessage): Promise<unknown> {
		return await message.util.reply(`${util.emojis.error} Do not use the template command.`);
	}
}
