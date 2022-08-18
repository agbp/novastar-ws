import {
	Session,
} from '@novastar/codec';

import { PortInfo } from 'serialport';
import appEnv from '../common/env';
import clog from '../common/log';
import { getNovastarCardData } from './novastarCard';
import { callNovastarSessionFunc, clearNovastarSessions } from './novastarCommon';
import {
	NovastarReqResult,
	SendingCardData,
	SerialBinding,
	ShortSendingCardData,
} from './types';

const serial = require('@novastar/serial');

export const novastarSerial: SerialBinding = serial.default;

export async function getNovastarData(
	nsSerial: SerialBinding = novastarSerial,
	emulateTimeoutError: boolean = appEnv.emulateTimeoutError(),
): Promise<NovastarReqResult> {
	const novastarRes: NovastarReqResult = {
		Error: 1,
		ErrorDescription: null,
		SendingCards: [],
	};

	try {
		const novastarCardsList: PortInfo[] = await nsSerial.findSendingCards();

		if (novastarCardsList.length > 0) {
			novastarRes.Error = 0;
			novastarRes.ErrorDescription = '';
			novastarRes.SendingCards = await Promise.all(novastarCardsList.map(
				async (nsCard: PortInfo): Promise<SendingCardData> => {
					const localRes: SendingCardData = await getNovastarCardData(nsSerial, nsCard.path);
					localRes.portInfo = nsCard;
					return localRes;
				},
			));
		} else {
			novastarRes.Error = 1;
			clog('no novastar cards detected');

			if (emulateTimeoutError) {
				const rejTest = await callNovastarSessionFunc(
					await nsSerial.open('COM1'),
					Session.prototype.hasDVISignalIn,
				);
				// eslint-disable-next-line no-console
				console.log(rejTest);
			}
			novastarRes.ErrorDescription = 'no novastar cards detected';
		}
	} catch (e) {
		novastarRes.Error = 3;
		novastarRes.ErrorDescription = String(e);
	} finally {
		clearNovastarSessions();
	}
	return novastarRes;
}

export async function getNovastarShortCardData(serialPort: string) {
	const shortRes: ShortSendingCardData = {
		Error: 1,
		DVI: 0,
		Port1: 0,
		Port2: 0,
	};
	const novastarFullRes = await getNovastarData();
	if (novastarFullRes.SendingCards.length > 0) {
		const cardData: SendingCardData | undefined = novastarFullRes.SendingCards.find(
			(el: SendingCardData) => el.COM === serialPort,
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

export function defaultErrorResultOnUnhandlederror(
	errorDescription?: string,
	short = false,
): NovastarReqResult | ShortSendingCardData {
	let result: NovastarReqResult | ShortSendingCardData;
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
