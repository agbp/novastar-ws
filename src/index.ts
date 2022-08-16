import {
	Calibration,
	DeviceType,
	DisplayMode,
	Session,
} from '@novastar/codec';

import { Request, Response } from 'express';
import { PortInfo } from 'serialport';
import {
	NovastarResult,
	SendingCardData,
	SendingCardPortData,
	SerialBinding,
	ShortCardData,
	TimeOutErrorInterface,
} from './types';

const serial = require('@novastar/serial');
// const codec = require('@novastar/codec');
const express = require('express');
const dotenv = require('dotenv');

const novastarSerial: SerialBinding = serial.default;

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
	clog('Unhandled Rejection at:', promise, 'reason:', reason);
	const sessions = novastarSerial.getSessions();
	sessions.forEach((session) => session.close());
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
	session: any,
	func: (...fargs: any) => Promise<any>,
	...args: any
): Promise<any> {
	try {
		const res = await func.apply(session ?? await nsSerial.open(portPath), args);
		// nsSerial.close(portPath);
		return res;
	} catch (e) {
		// nsSerial.close(portPath);
		return null;
	}
}

async function getSendingCardPortInfo(
	nsSerial: SerialBinding,
	portPath: string,
	session: any,
	portNum: 0 | 1 | 2 | 3,
): Promise<SendingCardPortData | null> {
	const res: SendingCardPortData = {
		portNumber: portNum,
		errorCode: 0,
		model: null,
		brightness: null,
		brightnessRGBV: null,
		calibrationMode: null,
		displayMode: null,
		gammaValue: null,
	};
	res.model = await callNovastarSessionFunc(
		nsSerial,
		portPath,
		session,
		Session.prototype.getModel,
		DeviceType.ReceivingCard,
		portNum,
		0,
	);
	if (res.model === null) return null;
	res.brightness = await callNovastarSessionFunc(
		nsSerial,
		portPath,
		session,
		Session.prototype.getBrightness,
		portNum,
	);
	res.brightnessRGBV = await callNovastarSessionFunc(
		nsSerial,
		portPath,
		session,
		Session.prototype.getBrightnessRGBV,
		portNum,
	);
	res.calibrationMode = await callNovastarSessionFunc(
		nsSerial,
		portPath,
		session,
		Session.prototype.getCalibrationMode,
		portNum,
	);
	res.displayMode = await callNovastarSessionFunc(
		nsSerial,
		portPath,
		session,
		Session.prototype.getDisplayMode,
		portNum,
	);
	res.gammaValue = await callNovastarSessionFunc(
		nsSerial,
		portPath,
		session,
		Session.prototype.getGammaValue,
		portNum,
	);
	return res;
}

async function getSendingCardPortsInfo(
	nsSerial: SerialBinding,
	portPath: string,
	session: any,
): Promise<SendingCardPortData[]> {
	const res: SendingCardPortData[] = [];
	for (let portN: 0 | 1 | 2 | 3 = 0; portN <= 3; portN += 1) {
		// eslint-disable-next-line no-await-in-loop
		const portData = await getSendingCardPortInfo(
			nsSerial,
			portPath,
			session,
			portN as 0 | 1 | 2 | 3,
		);
		if (portData) res.push(portData);
	}
	return res;
}

async function getNovastarCardData(
	nsSerial: SerialBinding,
	portPath: string,
): Promise<SendingCardData> {
	const res: SendingCardData = {
		errorCode: 0,
		errorDescription: null,
		COM: portPath,
		version: null,
		DVI: null,
		autobrightness: null,
		portInfo: null,
		portsData: [],
	};
	try {
		const session = await nsSerial.open(portPath);
		res.DVI = await callNovastarSessionFunc(
			nsSerial,
			portPath,
			session,
			Session.prototype.hasDVISignalIn,
		);
		res.version = await callNovastarSessionFunc(
			nsSerial,
			portPath,
			session,
			Session.prototype.getSendingCardVersion,
		);
		res.autobrightness = await callNovastarSessionFunc(
			nsSerial,
			portPath,
			session,
			Session.prototype.getAutobrightnessMode,
		);
		res.portsData = await getSendingCardPortsInfo(nsSerial, portPath, session);
	} catch (e) {
		res.errorCode = 1;
		res.errorDescription = String(e);
	} finally {
		nsSerial.close(portPath);
	}
	return res;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getNovastarCardData2(nsSerial: any, portPath: string): Promise<SendingCardData> {
	const res: SendingCardData = {
		errorCode: 0,
		errorDescription: null,
		COM: null,
		version: null,
		DVI: null,
		autobrightness: null,
		portInfo: null,
		portsData: [],
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
	nsSerial: SerialBinding,
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
			novastarRes.Error = 1;
			clog('no novastar cards detected');
			if (test && !(query && query.port)) {
				novastarRes.SendingCards.push({
					errorCode: 0,
					errorDescription: '',
					COM: 'COM1',
					version: 'some version',
					DVI: true,
					autobrightness: false,
					portInfo: {
						path: 'COM1',
						manufacturer: 'some manufacturer',
						serialNumber: 'some serial',
						pnpId: 'some pnpId',
						locationId: 'locationId',
						productId: 'productId',
						vendorId: 'vendorId',
					},
					portsData: [{
						portNumber: 0,
						model: 'some model for test',
						brightness: 10,
						brightnessRGBV: {
							overall: 10,
							red: 20,
							green: 20,
							blue: 20,
							vRed: 30,
						},
						calibrationMode: {
							isOn: true,
							type: Calibration.Brightness,
						},
						displayMode: DisplayMode.Grayscale,
						errorCode: 0,
						gammaValue: 10,
					}],
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
			novastarRes.Error = 0;
			novastarRes.ErrorDescription = '';
			novastarRes.SendingCards = await Promise.all(novastarCardsList.map(
				async (nsCard: PortInfo): Promise<SendingCardData> => {
					const localRes: SendingCardData = test
						? await getNovastarCardData2(nsSerial, nsCard.path)
						: await getNovastarCardData(nsSerial, nsCard.path);
					localRes.portInfo = nsCard;
					return localRes;
				},
			));
		}
	} catch (e) {
		novastarRes.Error = 3;
		novastarRes.ErrorDescription = String(e);
	} finally {
		const sessions = novastarSerial.getSessions();
		sessions.forEach((session) => session.close());
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
				shortRes.Error = cardData.errorCode;
				shortRes.DVI = cardData.DVI ? 1 : 0;
				shortRes.Port1 = cardData.portsData.find((portData) => portData.portNumber === 0) ? 1 : 0;
				shortRes.Port2 = cardData.portsData.find((portData) => portData.portNumber === 1) ? 1 : 0;
			}
		}
		return shortRes;
	}
	return novastarRes;
}

function timeOutHandler(req: Request, res: Response) {
	const timeOutInterval = setInterval(() => {
		const nsRes: NovastarResult = {
			Error: 2,
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
