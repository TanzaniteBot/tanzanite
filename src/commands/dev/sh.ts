import { BotCommand, PermissionLevel } from '../../extensions/BotCommand';
import { Message } from 'discord.js';
import { spawn } from 'child_process'

const execAsync = (command: string) => {
	return new Promise((resolve, reject) => {
		try {
			const cmd = spawn(command)
			const out: string[] = []
			cmd.stdout.on('data', (data) => {
				out.push('[STDOUT] ' + data)
			})
			cmd.stderr.on('data', (data) => {
				out.push('[STDERR] ' + data)
			})
			cmd.on('exit', (code) => {
				out.push('Process exited with code ' + code)
			})
			resolve(out)
		} catch (e) {
			reject(e)
		}
	})
}

export default class ShCommand extends BotCommand {
	public constructor() {
		super('sh', {
			aliases: ['sh', 'shell', 'cmd'],
			category: 'owner',
			description: {
				content: 'Runs a shell command',
				usage: 'sh <command>',
				examples: ['sh git pull'],
			},
			args: [
				{
					id: 'command',
					type: 'string',
					match: 'content',
					prompt: {
						start: 'What would you like run',
					},
				}
			],
			permissionLevel: PermissionLevel.Owner,
		});
	}
	public async exec(message: Message, { command }: { command: string }): Promise<void> {
		const msg = await message.util.send('Running...')
		const output = await execAsync(command)
		await msg.edit(output, {
			code: 'sh'
		})
	}
}
