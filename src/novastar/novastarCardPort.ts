import {
	DeviceType,
	Session,
} from '@novastar/codec';
import SerialPort from 'serialport';
import clog from '../common/log';
import { callNovastarSessionFunc, clearNovastarSessions, novastarSerial } from './novastarCommon';
import { NovastarCardPortNum, SendingCardPortData, SerialBinding } from './types';

function emptyPortData(portNum: NovastarCardPortNum): SendingCardPortData {
	return {
		portNumber: portNum,
		errorCode: 0,
		model: null,
		brightness: null,
		brightnessRGBV: null,
		calibrationMode: null,
		displayMode: null,
		gammaValue: null,
	};
}

async function getSendingCardPortInfo(
	session: Session<SerialPort>,
	portNum: NovastarCardPortNum,
): Promise<SendingCardPortData | null> {
	const res: SendingCardPortData = emptyPortData(portNum);
	res.model = await callNovastarSessionFunc(
		session,
		Session.prototype.getModel,
		DeviceType.ReceivingCard,
		portNum,
		0,
	);
	if (res.model === null) return null;
	res.brightness = await callNovastarSessionFunc(
		session,
		Session.prototype.getBrightness,
		portNum,
	);
	res.brightnessRGBV = await callNovastarSessionFunc(
		session,
		Session.prototype.getBrightnessRGBV,
		portNum,
	);
	res.calibrationMode = await callNovastarSessionFunc(
		session,
		Session.prototype.getCalibrationMode,
		portNum,
	);
	res.displayMode = await callNovastarSessionFunc(
		session,
		Session.prototype.getDisplayMode,
		portNum,
	);
	res.gammaValue = await callNovastarSessionFunc(
		session,
		Session.prototype.getGammaValue,
		portNum,
	);
	return res;
}

export async function getSendingCardPortsInfo(
	session: Session<SerialPort>,
): Promise<SendingCardPortData[]> {
	const res: SendingCardPortData[] = [];
	for (let portN: NovastarCardPortNum = 0; portN <= 3; portN += 1) {
		// eslint-disable-next-line no-await-in-loop
		const portData = await getSendingCardPortInfo(
			session,
			portN as NovastarCardPortNum,
		);
		if (portData) res.push(portData);
	}
	return res;
}

export async function setBrightness(
	serialPortPath: string,
	portNum: NovastarCardPortNum,
	brightnessValue: number,
	nsSerial: SerialBinding = novastarSerial,
) {
	const session = await nsSerial.open(serialPortPath);
	const res = await callNovastarSessionFunc(
		session,
		Session.prototype.setBrightness,
		brightnessValue,
		portNum,
	);
	clog('res = ', res);
	clearNovastarSessions();
	return res;
}
