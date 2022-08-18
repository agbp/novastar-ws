const dotenv = require('dotenv');

interface AppEnv {
	test: boolean,
	silent: boolean,
	port: number,
	emulateTimeoutError: boolean,
}

function argsCheck(args: string[], keyword: string): boolean {
	const lcKeyword = keyword.toLowerCase();
	return Boolean(args.find((el: string) => el.toLowerCase() === lcKeyword));
}

function getTestModeFromArgs(args: string[]): boolean {
	return argsCheck(args, 'test') || process.env.TEST_MODE === 'true';
}

function getSilentModeFromArgs(args: string[]): boolean {
	return argsCheck(args, 'silent') || process.env.CONSOLE_LOG !== 'true';
}

function getemulateTimeoutErrorFromArgs(args: string[]): boolean {
	return argsCheck(args, 'emulatetimeouterror');
}

function getListeningPortFromArgs(args: string[]): number {
	const portArg = args.find((el: string) => el.toLowerCase().startsWith('port:'));
	if (portArg) {
		const numPort = Number(portArg.slice(5));
		if (numPort !== 0) return numPort;
	}
	return Number(process.env.PORT) || 5000;
}

function appEnvInit(args: string[]): AppEnv {
	return {
		silent: getSilentModeFromArgs(args),
		test: getTestModeFromArgs(args),
		port: getListeningPortFromArgs(args),
		emulateTimeoutError: getemulateTimeoutErrorFromArgs(args),
	};
}

dotenv.config();
const appEnvStore = appEnvInit(process.argv.slice(2));

const appEnv = {
	silent(aEnv: AppEnv = appEnvStore) {
		return aEnv.silent;
	},
	test(aEnv: AppEnv = appEnvStore) {
		return aEnv.test;
	},
	port(aEnv: AppEnv = appEnvStore) {
		return aEnv.port;
	},
	emulateTimeoutError(aEnv: AppEnv = appEnvStore) {
		return aEnv.emulateTimeoutError;
	},
};

export default appEnv;
