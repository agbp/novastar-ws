import {
	DeviceType,
	Session,
} from '@novastar/codec';
import { callNovastarSessionFunc } from './novastarCommon';
import {
	emptyScreenPortData,
	NovastarCardPortNum,
	novastarCardPortsAmount,
	NovastarSession,
	ScreenPortData,
} from './types';

async function getSendingCardPortInfo(
	nsSession: NovastarSession,
	portNum: NovastarCardPortNum,
): Promise<ScreenPortData> {
	const res: ScreenPortData = { ...emptyScreenPortData, portNumber: portNum };
	res.model = await callNovastarSessionFunc(
		nsSession,
		Session.prototype.getModel,
		DeviceType.ReceivingCard,
		portNum,
		0,
	);
	if (res.model === null) return res;
	res.active = true;
	const functionsToCAll = [
		Session.prototype.getBrightness,
		Session.prototype.getBrightnessRGBV,
		Session.prototype.getCalibrationMode,
		Session.prototype.getDisplayMode,
		Session.prototype.getGammaValue,
	];
	const arrayRes = await Promise.all(functionsToCAll.map((f) => callNovastarSessionFunc(
		nsSession,
		f,
		portNum,
	)));
	[res.brightness,
	res.brightnessRGBV,
	res.calibrationMode,
	res.displayMode,
	res.gammaValue] = arrayRes;
	return res;
}

export async function getSendingCardPortsInfo(
	nsSession: NovastarSession,
): Promise<ScreenPortData[]> {
	// const res: ScreenPortData[] = [];
	return Promise.all(Array.from(Array(novastarCardPortsAmount).keys())
		.map((i: number) => getSendingCardPortInfo(
			nsSession,
			i as NovastarCardPortNum,
		)));
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
): Promise<boolean> {
	const portsInfo = await (await getSendingCardPortsInfo(nsSession))
		.filter((portInfo) => portInfo.active);
	const res = await Promise.all(portsInfo.map((portInfo) => setBrightness(
		nsSession,
		portInfo.portNumber,
		brightnessValue,
	)));
	return !res.includes(false);
}
