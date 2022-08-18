import {
	Calibration,
	DeviceType,
	DisplayMode,
	Session,
} from '@novastar/codec';

import { PortInfo } from 'serialport';
import appEnv from '../common/env';
import clog from '../common/log';
import {
	NovastarResult,
	SendingCardData,
	SendingCardPortData,
	SerialBinding,
	ShortCardData,
} from './types';

const serial = require('@novastar/serial');

const novastarSerial: SerialBinding = serial.default;

async function callNovastarSessionFunc(
	session: any,
	func: (...fargs: any) => Promise<any>,
	...args: any
): Promise<any> {
	try {
		const res = await func.apply(session, args);
		return res;
	} catch (e) {
		return null;
	}
}

export function clearNovastarSessions(nsSerial: SerialBinding = novastarSerial) {
	const sessions = nsSerial.getSessions();
	sessions.forEach((session) => session.close());
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
			session,
			Session.prototype.hasDVISignalIn,
		);
		res.version = await callNovastarSessionFunc(
			session,
			Session.prototype.getSendingCardVersion,
		);
		res.autobrightness = await callNovastarSessionFunc(
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

export async function getNovastarData(
	query: any = null,
	test: boolean = false,
	nsSerial: SerialBinding = novastarSerial,
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

			if (appEnv.emulateTimeoutError()) {
				const rejTest = await callNovastarSessionFunc(
					await nsSerial.open('COM1'),
					Session.prototype.hasDVISignalIn,
				);
				// eslint-disable-next-line no-console
				console.log(rejTest);
			}
		} else {
			novastarRes.Error = 0;
			novastarRes.ErrorDescription = '';
			novastarRes.SendingCards = await Promise.all(novastarCardsList.map(
				async (nsCard: PortInfo): Promise<SendingCardData> => {
					const localRes: SendingCardData = await getNovastarCardData(nsSerial, nsCard.path);
					localRes.portInfo = nsCard;
					return localRes;
				},
			));
		}
	} catch (e) {
		novastarRes.Error = 3;
		novastarRes.ErrorDescription = String(e);
	} finally {
		clearNovastarSessions();
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

export function defaultErrorResultOnUnhandlederror(
	errorDescription?: string,
	short = false,
): NovastarResult | ShortCardData {
	let result: NovastarResult | ShortCardData;
	if (short) {
		result = {
			Error: 2,
			DVI: 0,
			Port1: 0,
			Port2: 0,
		};
	} else {
		result = {
			Error: 2,
			ErrorDescription: errorDescription ?? '',
			SendingCards: [],
		};
	}
	return result;
}
