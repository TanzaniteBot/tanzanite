import { BushCommand, PermissionLevel } from '../../lib/extensions/BushCommand';
import { spawn } from 'child_process';
import { Message } from 'discord.js';

const execAsync = (command: string) => {
	const cmdSplit = command.split(' ');
	return new Promise((resolve, reject) => {
		try {
			const cmd = spawn(cmdSplit[0], cmdSplit.slice(1, cmdSplit.length));
			const out: string[] = [];
			cmd.stdout.on('data', data => {
				out.push('[STDOUT] ' + data);
			});
			cmd.stderr.on('data', data => {
				out.push('[STDERR] ' + data);
			});
			cmd.on('exit', code => {
				out.push('Process exited with code ' + code);
			});
			resolve(out);
		} catch (e) {
			reject(e);
		}
	});
};

export default class ShCommand extends BushCommand {
	public constructor() {
		super('sh', {
			aliases: ['sh', 'shell', 'cmd'],
			category: 'dev',
			description: {
				content: 'Runs a shell command',
				usage: 'sh <command>',
				examples: ['sh git pull']
			},
			args: [
				{
					id: 'command',
					type: 'string',
					match: 'content',
					prompt: {
						start: 'What would you like run',
						retry: '<:error:837123021016924261> Invalid command to run.'
					}
				}
			],
			permissionLevel: PermissionLevel.Owner,
			clientPermissions: ['SEND_MESSAGES']
		});
	}
	public async exec(message: Message, { command }: { command: string }): Promise<void> {
		if (!this.client.config.owners.includes(message.author.id)) {
			await message.channel.send('<:error:837123021016924261> Only my owners can use this command.');
			return;
		}
		const msg = await message.util.reply('Running...');
		const output = await execAsync(command);
		await msg.edit(output, {
			code: 'sh'
		});
	}
}
