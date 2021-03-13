module.exports = {
	apps: [{
		name: 'MBot',
		script: 'yarn',
		args: 'start',
		max_memory_restart: '1995M',
		node_args: [
			'--max_old_space_size=2000'
		],
		env: {
			'FORCE_COLOR':'1'
		},
	}],
};
