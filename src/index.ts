// import serial from '@novastar/serial';
// import codec from '@novastar/codec';
// // import { Request, DeviceType } from '@novastar/codec';
// import express from 'express';
// import dotenv from 'dotenv';
const serial = require('@novastar/serial');
const codec = require('@novastar/codec');
// import { Request, DeviceType } from '@novastar/codec';
const express = require('express');
const dotenv = require('dotenv');
// import SerialPort from 'serialport';

interface SendingCardData {
	COM: string | null,
	Version: string | null,
	DVI: boolean | null,
	Port1: boolean | null,
	Port1Model: string | null,
	Port2: boolean | null,
	Port2Model: string | null,
	Error: boolean | null,
	ErrorDescription: string | null,
}

interface ShortCardData {
	Error: 0 | 1,
	DVI: 0 | 1,
	Port1: 0 | 1,
	Port2: 0 | 1,
}

interface NovastarResult {
	Error: boolean | null,
	ErrorDescription: string | null,
	SendingCards: SendingCardData[],
}

dotenv.config();
const novastarSerial = serial.default;

// const [port] = await serial.findSendingCards();
// const session = await serial.open(port.path);
// const readReq = new Request(1);
// readReq.deviceType = DeviceType.ReceivingCard;
// readReq.address = 0x02000001;
// readReq.port = 0;
// const { data: [value] } = await session.connection.send(readReq);

// // Close all serial sessions
// serial.release();

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

async function getDVI(portPath: any, nsSerial: any): Promise<boolean | null> {
	try {
		const session = await nsSerial.open(portPath);
		const res = await session.hasDVISignalIn();
		return res;
	} catch (e) {
		return null;
	}
}

async function getModel(
	portPath: any,
	nsSerial: any,
	type: any,
	port: number = 0,
	rcvIndex: number = 0,
): Promise<any> {
	try {
		const session = await nsSerial.open(portPath);
		const res = await session.getModel(type, port, rcvIndex);
		return res;
	} catch (e) {
		return null;
	}
}

async function getSendingCardVersion(portPath: any, nsSerial: any): Promise<string | null> {
	try {
		const session = await nsSerial.open(portPath);
		const res = await session.getSendingCardVersion();
		return res;
	} catch (e) {
		return null;
	}
}

async function getNovastarCardData(
	portPath: string,
	nsSerial: any,
): Promise<SendingCardData | ShortCardData> {
	const res: SendingCardData = {
		COM: portPath,
		Version: null,
		DVI: null,
		Port1: null,
		Port1Model: null,
		Port2: null,
		Port2Model: null,
		Error: null,
		ErrorDescription: null,
	};
	try {
		// const session = await nsSerial.open(portPath);
		// res.DVI = await session.hasDVISignalIn();
		// const test = await session.getModel(codec.DeviceType.ReceivingCard);
		res.DVI = await getDVI(portPath, nsSerial);
		res.Port1Model = await getModel(portPath, nsSerial, codec.DeviceType.ReceivingCard, 0);
		res.Port1 = res.Port1Model !== null;
		res.Port2Model = await getModel(portPath, nsSerial, codec.DeviceType.ReceivingCard, 1);
		res.Port2 = res.Port2Model !== null;
		res.Version = await getSendingCardVersion(portPath, nsSerial);
		// const readReq: any = new codec.RequestPackage(1);
		// readReq.deviceType = codec.DeviceType.ReceivingCard;
		// readReq.address = 0x02000001;
		// readReq.port = 0;
		// (session.connection.send(readReq) as Promise<any>).then((reqRes: any) => {
		// 	res.Error = false;
		// 	res.ErrorDescription = '';
		// 	console.log(reqRes);
		// }).catch((e: any) => {
		// 	res.Error = true;
		// 	res.ErrorDescription = String(e);
		// });
		// const { data: [value] } = await session.connection.send(readReq);
	} catch (e) {
		res.Error = true;
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
		Error: null,
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
	alt: boolean = false,
): Promise<NovastarResult | ShortCardData> {
	const novastarRes: NovastarResult = {
		Error: null,
		ErrorDescription: null,
		SendingCards: [],
	};

	try {
		const novastarCardsList = await nsSerial.findSendingCards();

		if (novastarCardsList.length <= 0) {
			novastarRes.Error = true;
			clog('no novastar cards detected');
			if (TEST_MODE && !(query && query.port)) {
				novastarRes.SendingCards.push({
					COM: 'COM1',
					Version: 'some version',
					DVI: true,
					Port1: false,
					Port1Model: null,
					Port2: true,
					Port2Model: 'some test model for port2',
					Error: false,
					ErrorDescription: '',
				});
				novastarRes.ErrorDescription = 'no novastar cards detected, TEST_MODE is on, test data added';
			} else {
				novastarRes.ErrorDescription = 'no novastar cards detected';
			}
		} else {
			novastarRes.Error = false;
			novastarRes.ErrorDescription = '';
			novastarRes.SendingCards = await Promise.all(novastarCardsList.map(
				async (nsCard: any): Promise<SendingCardData | ShortCardData> => {
					const localRes = alt
						? await getNovastarCardData2(nsCard.path, nsSerial)
						: await getNovastarCardData(nsCard.path, nsSerial);
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
				shortRes.Error = cardData.Error ? 1 : 0;
				shortRes.DVI = cardData.DVI ? 1 : 0;
				shortRes.Port1 = cardData.Port1 ? 1 : 0;
				shortRes.Port2 = cardData.Port2 ? 1 : 0;
			}
		}
		return shortRes;
	}
	return novastarRes;
}

const app = express();
app.use(express.json());
app.get('/', async (req: any, res: any) => {
	try {
		const nsRes = await getNovastarData(novastarSerial, req.query);
		return res.status(200).json(nsRes);
	} catch (e) {
		return res.status(500).json(e);
	}
});
app.get('/test', async (req: any, res: any) => {
	try {
		const nsRes = await getNovastarData(novastarSerial, req.query, true);
		return res.status(200).json(nsRes);
	} catch (e) {
		return res.status(500).json(e);
	}
});

try {
	app.listen(PORT, () => {
		// eslint-disable-next-line no-console
		console.log(`Server started on port ${PORT}`);
		// eslint-disable-next-line no-console
		console.log('Monitoring novastar devices web service by Andrey.L.Golovin@gmail.com');
		// eslint-disable-next-line no-console
		console.log('usage: ');
		// eslint-disable-next-line no-console
		console.log('nowastar-ws-win.exe [port:5000] [silent] [test]');
		if (TEST_MODE) {
			clog('TEST_MODE is on');
		}
	});
} catch (e) {
	// eslint-disable-next-line no-console
	console.log(e);
}
