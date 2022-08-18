import clog from './log';

interface UnhandledErrorInterface {
	unhandlederrorHandlerIsActive: boolean,
	error: boolean,
	errorDescription: string,
	promise: Promise<any> | null,
	reason: any,
	monitoringInterval: NodeJS.Timer | null,
}

const unhandledError: UnhandledErrorInterface = {
	unhandlederrorHandlerIsActive: false,
	error: false,
	errorDescription: '',
	promise: null,
	reason: null,
	monitoringInterval: null,
};

function clearUnhandledErrorMonitorInterval() {
	if (unhandledError.monitoringInterval) {
		clearInterval(unhandledError.monitoringInterval);
		unhandledError.monitoringInterval = null;
	}
}

function clearUnhandledErrorFlags() {
	unhandledError.error = false;
	unhandledError.errorDescription = '';
	unhandledError.promise = null;
	unhandledError.reason = null;
}

export function setUnhandledErrorHandler(
	onError?: (errDescription?: string) => void,
	clear: boolean = false,
	clearInterval: boolean = false,
) {
	process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
		clog('Unhandled Rejection at:', promise, 'reason:', reason);
		unhandledError.error = true;
		unhandledError.promise = promise;
		unhandledError.reason = reason;
		if (reason) {
			if (reason instanceof Error && reason.stack) {
				unhandledError.errorDescription = reason.stack;
			} else {
				unhandledError.errorDescription = String(reason);
			}
		}
		if (onError) {
			onError(unhandledError.errorDescription);
		}
		if (clear) {
			clearUnhandledErrorFlags();
		}
		if (clearInterval) {
			clearUnhandledErrorMonitorInterval();
		}
	});
	unhandledError.unhandlederrorHandlerIsActive = true;
}

export function setUnhandledErrorMonitoring(
	callback: (ErrorDescription?: string) => void,
	clearInterval = true,
	clearErrorFlags = true,
	intervalMs = 1000,
) {
	if (!unhandledError.unhandlederrorHandlerIsActive) {
		throw new Error('You should call "setUnhandledErrorHandler" before "setUnhandledErrorMonitoring"');
	}
	unhandledError.monitoringInterval = setInterval(() => {
		if (unhandledError.error) {
			callback(unhandledError.errorDescription);
			if (clearErrorFlags) {
				clearUnhandledErrorFlags();
			}
			if (clearInterval) {
				clearUnhandledErrorMonitorInterval();
			}
		}
	}, intervalMs);
	return unhandledError.monitoringInterval;
}

export function dismissUnhandledErrorMonitoring() {
	clearUnhandledErrorMonitorInterval();
}
