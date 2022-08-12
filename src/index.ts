import serial from '@novastar/serial';
import codec from '@novastar/codec';
// import { Request, DeviceType } from '@novastar/codec';
import express from 'express';
import dotenv from 'dotenv';
// import SerialPort from 'serialport';

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

const TEST_MODE = Boolean(process.env.TEST_MODE);

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

interface NovastarResult {
	Error: boolean | null,
	ErrorDescription: string | null,
	SendingCards: SendingCardData[],
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

async function getNovastarCardData(portPath: string, nsSerial: any): Promise<SendingCardData> {
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
		const test2 = await getModel(portPath, nsSerial, codec.DeviceType.ReceivingCard, 2);
		console.log(test2);
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
	try {
		let connection;

		const port = new SerialPort(portPath, { baudRate: 115200 }, () => {
			connection = new codec.Connection(port);

			const readReq = new codec.RequestPackage(1);
			readReq.deviceType = codec.DeviceType.ReceivingCard;
			readReq.address = 0x02000001;
			readReq.port = 1;
			connection.send(readReq).then((data) => {
				console.log('data = ', data);
			});
		});

		// const { data: [value] } = await session.connection.send(readReq);
	} catch (e) {
		res.Error = true;
		res.ErrorDescription = String(e);
	}
	return res;
}

async function getNovastarData(nsSerial: any, alt: boolean = false): Promise<NovastarResult> {
	const novastarRes: NovastarResult = {
		Error: null,
		ErrorDescription: null,
		SendingCards: [],
	};

	try {
		const novastarCardsList = await nsSerial.findSendingCards();

		if (novastarCardsList.length <= 0) {
			novastarRes.Error = true;
			console.log('no novastar cards detected');
			if (TEST_MODE) {
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
				async (nsCard: any): Promise<SendingCardData> => {
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
	return novastarRes;
}

const PORT = Number(process.env.PORT) || 5000;

const app = express();
app.use(express.json());
app.get('/', async (req, res) => {
	const nsRes = await getNovastarData(novastarSerial);
	return res.status(200).json(nsRes);
});
app.get('/test', async (req, res) => {
	const nsRes = await getNovastarData(novastarSerial, true);
	return res.status(200).json(nsRes);
});

try {
	app.listen(PORT, () => {
		console.log(`Server started on port ${PORT}`);
	});
} catch (e) {
	console.log(e);
}
