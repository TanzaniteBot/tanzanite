// import { init } from './lib/utils/BushLogger.js';
// // creates proxies on console.log and console.warn
// // also starts a REPL session
// init();

// eslint-disable-next-line no-constant-condition
if (false) {
	// const { dirname } = await import('path');
	// const { fileURLToPath } = await import('url');
	// const { default: config } = await import('../config/options.js');
	// const { Sentry } = await import('./lib/common/Sentry.js');
	// const { BushClient } = await import('./lib/index.js');
	//
	// const isDry = process.argv.includes('dry');
	// if (!isDry && config.credentials.sentryDsn !== null)
	// 	new Sentry(dirname(fileURLToPath(import.meta.url)) || process.cwd(), config);
	// BushClient.extendStructures();
	// const client = new BushClient(config);
	// if (!isDry) await client.dbPreInit();
	// await client.init();
	// if (isDry) {
	// 	await client.destroy();
	// 	process.exit(0);
	// } else {
	// 	await client.start();
	// }
} else {
	import('./lib/common/util/Minecraft.js');
}
