/* eslint-disable no-undef, @typescript-eslint/no-require-imports */
let user, host;

try {
	({ user, host } = require('./ecosystem-info.json'));
} catch {
	user = 'ironmoon';
	host = 'localhost';
}

module.exports = {
	apps: [
		...['', '-beta'].map((e) => ({
			name: `tanzanite${e}`,
			script: 'yarn',
			args: 'start:raw',
			out_file: `../tanzanite${e}.log`,
			error_file: `../tanzanite${e}.log`,
			max_memory_restart: '1G',
			node_args: ['--max_old_space_size=2048'],
			env: { FORCE_COLOR: '3' },
			exp_backoff_restart_delay: 2500,
			wait_ready: true
		}))
	],

	deploy: {
		...Object.fromEntries(
			['production', 'beta'].map((e) => [
				e,
				{
					user,
					host,
					'ref': `origin/${e === 'production' ? 'master' : 'beta'}`,
					'repo': 'https://github.com/TanzaniteBot/tanzanite.git',
					'path': `/code/tanzanite${e === 'beta' ? '-beta' : ''}`,
					'post-deploy': `yarn install && yarn build && pm2 start ecosystem.config.cjs --only tanzanite${
						e === 'beta' ? '-beta' : ''
					}`
				}
			])
		)
	}
};
