import {
	Calibration,
	DisplayMode,
	Session,
} from '@novastar/codec';

import { getSendingCardPortsInfo } from './novastarCardPort';
import { callNovastarSessionFunc } from './novastarCommon';
import {
	NovastarReqResult,
	SendingCardData,
	SerialBinding,
	ShortSendingCardData,
} from './types';

function emptyCardData(serialPortPath?: string): SendingCardData {
	return {
		errorCode: 0,
		errorDescription: null,
		COM: serialPortPath ?? null,
		version: null,
		DVI: null,
		autobrightness: null,
		portInfo: null,
		portsData: [],
	};
}

export async function getNovastarCardData(
	nsSerial: SerialBinding,
	serialPortPath: string,
): Promise<SendingCardData> {
	const res: SendingCardData = emptyCardData();
	try {
		const session = await nsSerial.open(serialPortPath);
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
		res.portsData = await getSendingCardPortsInfo(session);
	} catch (e) {
		res.errorCode = 1;
		res.errorDescription = String(e);
	} finally {
		nsSerial.close(serialPortPath);
	}
	return res;
}

export function getTestCardData(): NovastarReqResult {
	return {
		Error: 3,
		ErrorDescription: 'no novastar cards detected, TEST_MODE is on, test data added',
		SendingCards: [
			{
				errorCode: 3,
				errorDescription: 'test',
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
					errorCode: 3,
					gammaValue: 10,
				}],
			},
		],
	};
}
export function getTestCardShortData(): ShortSendingCardData {
	return {
		Error: 3,
		DVI: 1,
		Port1: 0,
		Port2: 1,
	};
}
