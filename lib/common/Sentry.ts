import type { Config } from '#config';
import { rewriteFramesIntegration } from '@sentry/integrations';
import * as SentryNode from '@sentry/node';
import { Integrations } from '@sentry/node';

export class Sentry {
	public constructor(rootdir: string, config: Config) {
		if (config.credentials.sentryDsn === null) throw TypeError('sentryDsn cannot be null');

		SentryNode.init({
			dsn: config.credentials.sentryDsn,
			environment: config.environment,
			tracesSampleRate: 1.0,
			integrations: [
				rewriteFramesIntegration({
					root: rootdir
				}),
				new Integrations.OnUnhandledRejection({
					mode: 'none'
				})
			]
		});
	}
}
