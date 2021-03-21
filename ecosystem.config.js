module.exports = {
	apps: [
		{
			name: 'BushBot',
			script: 'yarn',
			args: 'start',
			max_memory_restart: '1G',
			node_args: ['--max_old_space_size=2000'],
			env: {
				FORCE_COLOR: '3'
			}
		}
	]
};
