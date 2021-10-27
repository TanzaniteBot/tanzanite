import * as SentryNode from '@sentry/node';
import config from './../../config/options';

export class Sentry {
	public constructor() {
		SentryNode.init({
			dsn: config.credentials.sentryDsn,
			environment: config.environment,
			tracesSampleRate: 1.0
		});
	}
}
