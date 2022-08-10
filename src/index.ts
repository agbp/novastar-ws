import serial from '@novastar/serial';
// import codec from '@novastar/codec';
// import { Request, DeviceType } from '@novastar/codec';
import express from 'express';
import dotenv from 'dotenv';

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
	COM: string,
	DVI: boolean,
	Port1: boolean,
	Port2: boolean,
	Error: boolean,
	ErrorDescription: string,
}

interface NovastarResult {
	Error: boolean,
	ErrorDescription: string,
	SendingCards: SendingCardData[],
}

async function getNovastarCardData(portPath: string, nsSerial: any): Promise<SendingCardData> {
	const res: SendingCardData = {
		COM: '',
		DVI: false,
		Error: false,
		ErrorDescription: '',
		Port1: false,
		Port2: false,
	};
	try {
		const session = await nsSerial.open(portPath);
		// const readReq: any = new codec.Request(1);
		// readReq.deviceType = codec.DeviceType.ReceivingCard;
		// readReq.address = 0x02000001;
		// readReq.port = 0;
		// const { data: [value] } = await session.connection.send(readReq);
	} catch (e) {
		res.Error = true;
		res.ErrorDescription = String(e);
	}
	return res;
}

async function getNovastarData(nsSerial: any): Promise<NovastarResult> {
	const novastarRes: NovastarResult = {
		Error: false,
		ErrorDescription: '',
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
			novastarRes.SendingCards = await Promise.all(novastarCardsList.map(
				async (nsCard: any): Promise<SendingCardData> => {
					const localRes = await getNovastarCardData(nsCard.path, nsSerial);
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

try {
	app.listen(PORT, () => {
		console.log(`Server started on port ${PORT}`);
	});
} catch (e) {
	console.log(e);
}
