import {
	DeviceType,
	Session,
} from '@novastar/codec';
import { callNovastarSessionFunc } from './novastarCommon';
import {
	emptySendingCardPortData,
	NovastarCardPortNum,
	novastarCardPortsAmount,
	NovastarSession,
	ScreenPortData,
} from './types';

async function getSendingCardPortInfo(
	nsSession: NovastarSession,
	portNum: NovastarCardPortNum,
): Promise<ScreenPortData | null> {
	const res: ScreenPortData = { ...emptySendingCardPortData, portNumber: portNum };
	res.model = await callNovastarSessionFunc(
		nsSession,
		Session.prototype.getModel,
		DeviceType.ReceivingCard,
		portNum,
		0,
	);
	if (res.model === null) return null;
	res.brightness = await callNovastarSessionFunc(
		nsSession,
		Session.prototype.getBrightness,
		portNum,
	);
	res.brightnessRGBV = await callNovastarSessionFunc(
		nsSession,
		Session.prototype.getBrightnessRGBV,
		portNum,
	);
	res.calibrationMode = await callNovastarSessionFunc(
		nsSession,
		Session.prototype.getCalibrationMode,
		portNum,
	);
	res.displayMode = await callNovastarSessionFunc(
		nsSession,
		Session.prototype.getDisplayMode,
		portNum,
	);
	res.gammaValue = await callNovastarSessionFunc(
		nsSession,
		Session.prototype.getGammaValue,
		portNum,
	);
	return res;
}

export async function getSendingCardPortsInfo(
	nsSession: NovastarSession,
): Promise<ScreenPortData[]> {
	const res: ScreenPortData[] = [];
	for (let portN: NovastarCardPortNum = 0; portN < novastarCardPortsAmount; portN += 1) {
		// eslint-disable-next-line no-await-in-loop
		const portData = await getSendingCardPortInfo(
			nsSession,
			portN as NovastarCardPortNum,
		);
		if (portData) res.push(portData);
	}
	return res;
}

export async function setBrightness(
	nsSession: NovastarSession,
	portNum: NovastarCardPortNum,
	brightnessValue: number,
) {
	await callNovastarSessionFunc(
		nsSession,
		Session.prototype.setBrightness,
		brightnessValue,
		portNum,
	);
	const actualBrightness = await callNovastarSessionFunc(
		nsSession,
		Session.prototype.getBrightness,
		portNum,
	);
	return actualBrightness === brightnessValue;
}

export async function setAllPortsBrightness(
	nsSession: NovastarSession,
	brightnessValue: number,
) {
	for (let portN: NovastarCardPortNum = 0; portN < novastarCardPortsAmount; portN += 1) {
		// eslint-disable-next-line no-await-in-loop
		setBrightness(nsSession, portN as NovastarCardPortNum, brightnessValue);
	}
}
