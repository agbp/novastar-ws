import serial from '@novastar/serial';
// import { Request, DeviceType } from '@novastar/codec';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

// const [port] = await serial.findSendingCards();
// const session = await serial.open(port.path);
// const readReq = new Request(1);
// readReq.deviceType = DeviceType.ReceivingCard;
// readReq.address = 0x02000001;
// readReq.port = 0;
// const { data: [value] } = await session.connection.send(readReq);

// // Close all serial sessions
// serial.release();

const novastarSerial = serial.default;
const novastarCardsList = await novastarSerial.findSendingCards();
const TEST_MODE = Boolean(process.env.TEST_MODE);

interface SendingCard {
	COM: number,
	DVI: boolean,
	Port1: boolean,
	Port2: boolean,
	Error: boolean,
}

interface NovastarRes {
	Error: boolean,
	ErrorDescription: string,
	SendingCards: SendingCard[],
}

function getNovastarData(): NovastarRes {
	const novastarRes: NovastarRes = {
		Error: false,
		ErrorDescription: '',
		SendingCards: [],
	};

	if (novastarCardsList.length <= 0) {
		novastarRes.Error = true;
		if (TEST_MODE) {
			console.log('no novastar cards detected');
			novastarRes.SendingCards.push({
				COM: 5,
				DVI: true,
				Port1: false,
				Port2: true,
				Error: false,
			});
			novastarRes.ErrorDescription = 'no novastar cards detected, TEST_MODE is on, test data added';
		} else {
			novastarRes.ErrorDescription = 'no novastar cards detected';
		}
	}
	return novastarRes;
}

const PORT = Number(process.env.PORT) || 5000;

const app = express();
app.use(express.json());
app.get('/', async (req, res) => {
	const nsRes = getNovastarData();
	return res.status(200).json(nsRes);
});

try {
	app.listen(PORT, () => {
		console.log(`Server started on port ${PORT}`);
	});
} catch (e) {
	console.log(e);
}
