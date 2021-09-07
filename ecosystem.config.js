module.exports = {
	apps: [
		{
			name: 'BushBot',
			script: 'yarn',
			args: 'start',
			out_file: '../bushbot.log',
			error_file: '../bushbot.log',
			max_memory_restart: '1G',
			node_args: ['--max_old_space_size=2048'],
			env: {
				FORCE_COLOR: '3'
			},
			exp_backoff_restart_delay: 2500,
			wait_ready: true
		},
		{
			name: 'BushBot-Beta',
			script: 'yarn',
			args: 'start',
			out_file: '../bushbot-beta.log',
			error_file: '../bushbot-beta.log',
			max_memory_restart: '1G',
			node_args: ['--max_old_space_size=2048'],
			env: {
				FORCE_COLOR: '3'
			},
			exp_backoff_restart_delay: 2500,
			wait_ready: true
		}
	],

	deploy: {
		production: {
			'user': 'pi',
			'host': '192.168.1.240',
			'ref': 'origin/master',
			'repo': 'git@github.com:NotEnoughUpdate/repository.git',
			'path': '/code/bush-bot',
			'post-deploy': 'yarn install'
		},
		beta: {
			'user': 'pi',
			'host': '192.168.1.240',
			'ref': 'origin/beta',
			'repo': 'git@github.com:Username/repository.git',
			'path': '/code/bush-bot-beta',
			'post-deploy': 'yarn install'
		}
	}
};
