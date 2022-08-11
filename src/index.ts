import serial from '@novastar/serial';
import codec from '@novastar/codec';
// import { Request, DeviceType } from '@novastar/codec';
import express from 'express';
import dotenv from 'dotenv';
import SerialPort from 'serialport';

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
	DVI: boolean | null,
	Port1: boolean | null,
	Port2: boolean | null,
	Error: boolean | null,
	ErrorDescription: string | null,
}

interface NovastarResult {
	Error: boolean | null,
	ErrorDescription: string | null,
	SendingCards: SendingCardData[],
}

async function getDVI(portPath: any, nsSerial: any): Promise<boolean> {
	const session = await nsSerial.open(portPath);
	return session.hasDVISignalIn();
}

async function getModel(portPath: any, type: any, nsSerial: any): Promise<any> {
	const session = await nsSerial.open(portPath);
	return session.getModel(type);
}

async function getSendingCardVersion(portPath: any, nsSerial: any): Promise<any> {
	const session = await nsSerial.open(portPath);
	return session.getSendingCardVersion();
}

async function getNovastarCardData(portPath: string, nsSerial: any): Promise<SendingCardData> {
	const res: SendingCardData = {
		COM: portPath,
		DVI: null,
		Port1: null,
		Port2: null,
		Error: null,
		ErrorDescription: null,
	};
	try {
		// const session = await nsSerial.open(portPath);
		// res.DVI = await session.hasDVISignalIn();
		// const test = await session.getModel(codec.DeviceType.ReceivingCard);
		res.DVI = await getDVI(portPath, nsSerial);
		const test2 = await getSendingCardVersion(portPath, nsSerial);
		console.log(test2);
		const test = await getModel(portPath, codec.DeviceType.ReceivingCard, nsSerial);
		console.log(test);
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
		DVI: null,
		Port1: null,
		Port2: null,
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
			readReq.port = 0;
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
					DVI: true,
					Port1: false,
					Port2: true,
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
