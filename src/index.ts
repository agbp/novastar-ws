import { DeviceType, Session } from '@novastar/codec';

import { Request, Response } from 'express';
import { PortInfo } from 'serialport';
import {
	NovastarResult,
	SendingCardData,
	SerialBinding,
	ShortCardData,
	TimeOutErrorInterface,
} from './types';

const serial: SerialBinding = require('@novastar/serial');
const codec = require('@novastar/codec');
const express = require('express');
const dotenv = require('dotenv');

const timeOutError: TimeOutErrorInterface = {
	error: false,
	errorDescription: '',
	promise: null,
	reason: null,
};

function clearTimeOutError() {
	timeOutError.error = false;
	timeOutError.errorDescription = '';
	timeOutError.promise = null;
	timeOutError.reason = null;
}

process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
	// eslint-disable-next-line no-console
	console.log('Unhandled Rejection at:', promise, 'reason:', reason);
	timeOutError.error = true;
	timeOutError.promise = promise;
	timeOutError.reason = reason;
	if (reason) {
		if (reason instanceof Error && reason.stack) {
			timeOutError.errorDescription = reason.stack;
		} else {
			timeOutError.errorDescription = String(reason);
		}
	}
});

dotenv.config();
const novastarSerial: SerialBinding = serial.default;

function isTestMode(args: string[]): boolean {
	return Boolean(args.find((el: string) => el.toLowerCase() === 'test'))
		|| process.env.TEST_MODE === 'true';
}

function isConsoleLogEnabled(args: string[]): boolean {
	return !(args.find((el: string) => el.toLowerCase() === 'silent'))
		&& process.env.CONSOLE_LOG === 'true';
}

function listeningPort(args: string[]): number {
	const portArg = args.find((el: string) => el.toLowerCase().startsWith('port:'));
	if (portArg) {
		const numPort = Number(portArg.slice(5));
		if (numPort !== 0) return numPort;
	}
	return Number(process.env.PORT) || 5000;
}

const runArgs = process.argv.slice(2);
const TEST_MODE: boolean = isTestMode(runArgs);
const CONSOLE_LOG: boolean = isConsoleLogEnabled(runArgs);
const PORT: number = listeningPort(runArgs);

function clog(...args: any) {
	if (CONSOLE_LOG) {
		// eslint-disable-next-line no-console
		console.log(...args);
	}
}

async function callNovastarSessionFunc(
	nsSerial: SerialBinding,
	portPath: string,
	func: (...fargs: any) => Promise<any>,
	...args: any
): Promise<any> {
	try {
		const session = await nsSerial.open(portPath);
		const res = await func.call(session, args);
		return res;
	} catch (e) {
		return null;
	}
}

async function getDVI1(nsSerial: SerialBinding, portPath: string): Promise<boolean | null> {
	return callNovastarSessionFunc(nsSerial, portPath, Session.prototype.hasDVISignalIn);
}

async function getDVI(nsSerial: SerialBinding, portPath: string): Promise<boolean | null> {
	try {
		const session = await nsSerial.open(portPath);
		const res = await session.hasDVISignalIn();
		return res;
	} catch (e) {
		return null;
	}
}

async function getModel(
	nsSerial: SerialBinding,
	portPath: string,
	type: DeviceType,
	port: number = 0,
	rcvIndex: number = 0,
): Promise<string | null> {
	try {
		const session = await nsSerial.open(portPath);
		const res = await session.getModel(type, port, rcvIndex);
		return res;
	} catch (e) {
		return null;
	}
}

async function getSendingCardVersion(
	nsSerial: SerialBinding,
	portPath: string,
): Promise<string | null> {
	try {
		const session = await nsSerial.open(portPath);
		const res = await session.getSendingCardVersion();
		return res;
	} catch (e) {
		return null;
	}
}

async function getNovastarCardData(
	nsSerial: SerialBinding,
	portPath: string,
): Promise<SendingCardData> {
	const res: SendingCardData = {
		COM: portPath,
		Version: null,
		DVI: null,
		Port1: null,
		Port1Model: null,
		Port2: null,
		Port2Model: null,
		ErrorCode: 0,
		ErrorDescription: null,
	};
	try {
		res.DVI = await getDVI(nsSerial, portPath);
		res.Port1Model = await getModel(nsSerial, portPath, codec.DeviceType.ReceivingCard, 0);
		res.Port1 = res.Port1Model !== null;
		res.Port2Model = await getModel(nsSerial, portPath, codec.DeviceType.ReceivingCard, 1);
		res.Port2 = res.Port2Model !== null;
		res.Version = await getSendingCardVersion(nsSerial, portPath);
		const test = await getDVI1(nsSerial, portPath);
	} catch (e) {
		res.ErrorCode = 1;
		res.ErrorDescription = String(e);
	}
	return res;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getNovastarCardData2(portPath: string, nsSerial: any): Promise<SendingCardData> {
	const res: SendingCardData = {
		COM: null,
		Version: null,
		DVI: null,
		Port1: null,
		Port1Model: null,
		Port2: null,
		Port2Model: null,
		ErrorCode: 0,
		ErrorDescription: null,
	};
	// try {
	// 	let connection;

	// 	const port = new SerialPort(portPath, { baudRate: 115200 }, () => {
	// 		connection = new codec.Connection(port);

	// 		const readReq = new codec.RequestPackage(1);
	// 		readReq.deviceType = codec.DeviceType.ReceivingCard;
	// 		readReq.address = 0x02000001;
	// 		readReq.port = 1;
	// 		connection.send(readReq).then((data) => {
	// 			console.log('data = ', data);
	// 		});
	// 	});

	// 	// const { data: [value] } = await session.connection.send(readReq);
	// } catch (e) {
	// 	res.Error = true;
	// 	res.ErrorDescription = String(e);
	// }
	return res;
}

async function getNovastarData(
	nsSerial: any,
	query: any = null,
	test: boolean = false,
): Promise<NovastarResult | ShortCardData> {
	const novastarRes: NovastarResult = {
		Error: null,
		ErrorDescription: null,
		SendingCards: [],
	};

	try {
		const novastarCardsList: PortInfo[] = await nsSerial.findSendingCards();

		if (novastarCardsList.length <= 0) {
			novastarRes.Error = true;
			clog('no novastar cards detected');
			if (test && !(query && query.port)) {
				novastarRes.SendingCards.push({
					COM: 'COM1',
					Version: 'some version',
					DVI: true,
					Port1: false,
					Port1Model: null,
					Port2: true,
					Port2Model: 'some test model for port2',
					ErrorCode: 0,
					ErrorDescription: '',
				});
				novastarRes.ErrorDescription = 'no novastar cards detected, TEST_MODE is on, test data added';
			} else {
				novastarRes.ErrorDescription = 'no novastar cards detected';
			}

			// // test tracing error with promice timeout rejection
			// // eslint-disable-next-line @typescript-eslint/no-unused-vars
			// const rejTest = await getDVI('COM1', nsSerial).catch((e) => {
			// 	// eslint-disable-next-line no-console
			// 	console.log(e);
			// });
		} else {
			novastarRes.Error = false;
			novastarRes.ErrorDescription = '';
			novastarRes.SendingCards = await Promise.all(novastarCardsList.map(
				async (nsCard: PortInfo): Promise<SendingCardData> => {
					const localRes = test
						? await getNovastarCardData2(nsSerial, nsCard.path)
						: await getNovastarCardData(nsSerial, nsCard.path);
					return localRes;
				},
			));
		}
	} catch (e) {
		novastarRes.Error = true;
		novastarRes.ErrorDescription = String(e);
	} finally {
		if (nsSerial.sessions.length > 0) {
			nsSerial.release();
		}
	}
	if (query && query.port) {
		const shortRes: ShortCardData = {
			Error: 1,
			DVI: 0,
			Port1: 0,
			Port2: 0,
		};
		if (novastarRes.SendingCards.length > 0) {
			const cardData: SendingCardData | undefined = novastarRes.SendingCards.find(
				(el) => el.COM === query.port,
			);
			if (cardData) {
				shortRes.Error = cardData.ErrorCode;
				shortRes.DVI = cardData.DVI ? 1 : 0;
				shortRes.Port1 = cardData.Port1 ? 1 : 0;
				shortRes.Port2 = cardData.Port2 ? 1 : 0;
			}
		}
		return shortRes;
	}
	return novastarRes;
}

function timeOutHandler(req: Request, res: Response) {
	const timeOutInterval = setInterval(() => {
		const nsRes: NovastarResult = {
			Error: true,
			ErrorDescription: '',
			SendingCards: [],
		};
		const nsShortRes: ShortCardData = {
			Error: 2,
			DVI: 0,
			Port1: 0,
			Port2: 0,
		};
		if (timeOutError.error) {
			nsRes.ErrorDescription = timeOutError.errorDescription;
			res.status(500).json((req.query && req.query.port) ? nsShortRes : nsRes);
			clearInterval(timeOutInterval);
			clearTimeOutError();
		}
	}, 1000);
	return timeOutInterval;
}

const app = express();
app.use(express.json());
app.get('/', async (req: Request, res: Response) => {
	const timeOutInterval = timeOutHandler(req, res);
	try {
		const nsRes = await getNovastarData(novastarSerial, req.query, TEST_MODE);
		return res.status(200).json(nsRes);
	} catch (e) {
		return res.status(500).json(e);
	} finally {
		clearInterval(timeOutInterval);
		clearTimeOutError();
	}
});
app.get('/test', async (req: Request, res: Response) => {
	const timeOutInterval = timeOutHandler(req, res);
	try {
		const nsRes = await getNovastarData(novastarSerial, req.query, true);
		return res.status(200).json(nsRes);
	} catch (e) {
		return res.status(500).json(e);
	} finally {
		clearInterval(timeOutInterval);
		clearTimeOutError();
	}
});

try {
	app.listen(PORT, () => {
		clog(`Server started on port ${PORT}`);
		clog('Monitoring novastar devices web service - https://github.com/agbp/novastar-ws');
		clog('usage: ');
		clog('nowastar-ws-win.exe [port:5000] [silent] [test]');
		if (TEST_MODE) {
			clog('TEST_MODE is on');
		}
	});
} catch (e) {
	// eslint-disable-next-line no-console
	console.log(e);
}
