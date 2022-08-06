import { RewriteFrames } from '@sentry/integrations';
import * as SentryNode from '@sentry/node';
import { Integrations } from '@sentry/node';
import type { Config } from '../../../config/Config.js';

export class Sentry {
	public constructor(rootdir: string, config: Config) {
		if (config.credentials.sentryDsn === null) throw TypeError('sentryDsn cannot be null');

		SentryNode.init({
			dsn: config.credentials.sentryDsn,
			environment: config.environment,
			tracesSampleRate: 1.0,
			integrations: [
				new RewriteFrames({
					root: rootdir
				}),
				new Integrations.OnUnhandledRejection({
					mode: 'none'
				})
			]
		});
	}
}
