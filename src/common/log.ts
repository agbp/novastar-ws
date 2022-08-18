import appEnv from './env';

export default function clog(...args: any) {
	if (!appEnv.silent()) {
		// eslint-disable-next-line no-console
		console.log(...args);
	}
}
