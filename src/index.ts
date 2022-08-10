import serial from '@novastar/serial';
import { Request, DeviceType } from '@novastar/codec';
import express from 'express';

require('dotenv').config();

// const [port] = await serial.findSendingCards();
// const session = await serial.open(port.path);
// const readReq = new Request(1);
// readReq.deviceType = DeviceType.ReceivingCard;
// readReq.address = 0x02000001;
// readReq.port = 0;
// const { data: [value] } = await session.connection.send(readReq);

// // Close all serial sessions
// serial.release();

const test = serial.default;
const test2 = await test.findSendingCards();

const PORT = Number(process.env.PORT) || 5000;

const app = express();
app.use(express.json());
app.get('/', async (req, res) => {
	const novastarData = {
		Error: false,
		SendingCards:
			[
				{
					COM: 5,
					DVI: true,
					Port1: false,
					Port2: true,
					Error: false,
				},
			],
	};
	return res.status(200).json(novastarData);
});
try {
	app.listen(PORT, () => {
		console.log(`Server started on port ${PORT}`);
	});
	if (!process.env.TIN_INVEST_API2_PRODUCTION_URL) {
		throw new Error('env.TIN_INVEST_API2_PRODUCTION_URL not defined');
	}
} catch (e) {
	console.log(e);
}

console.log(test2);
