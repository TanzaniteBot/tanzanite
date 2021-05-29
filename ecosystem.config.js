module.exports = {
	apps: [
		{
			name: 'BushBot-Dev',
			script: 'yarn',
			args: 'start',
			out_file: './combined-dev.log',
			error_file: './combined-dev.log',
			max_memory_restart: '2000M',
			node_args: ['--max_old_space_size=2048'],
			env: {
				FORCE_COLOR: '3'
			}
		}
	]
};
