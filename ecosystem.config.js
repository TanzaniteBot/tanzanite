module.exports = {
	apps: [
		{
			name: 'BushBot',
			script: 'yarn',
			args: 'start',
			out_file: './combined.log',
			error_file: './combined.log',
			max_memory_restart: '2000M',
			node_args: ['--max_old_space_size=2048'],
			env: {
				FORCE_COLOR: '3'
			}
		}
	]
};
