import {
	Session,
} from '@novastar/codec';

import { PortInfo } from 'serialport';
import appEnv from '../common/env';
import clog from '../common/log';
import { getNovastarCardData } from './novastarCard';
import { callNovastarSessionFunc, clearNovastarSessions, novastarSerial } from './novastarCommon';
import {
	NovastarReqResult,
	NovastarSession,
	ScreenPortShortData,
	SendingCardData,
	SerialBinding,
	ShortSendingCardData,
} from './types';

export async function openSession(
	serialPortPath: string,
	nsSerial: SerialBinding = novastarSerial,
): Promise<NovastarSession> {
	return { session: await nsSerial.open(serialPortPath), serialPortPath };
}

export function closeSession(nsSession: NovastarSession): boolean {
	return nsSession.session.close();
}

export async function getNovastarData(
	nsSerial: SerialBinding = novastarSerial,
	emulateTimeoutError: boolean = appEnv.emulateTimeoutError(),
): Promise<NovastarReqResult> {
	const novastarRes: NovastarReqResult = {
		error: 1,
		errorDescription: null,
		sendingCards: [],
	};

	try {
		const novastarCardsList: PortInfo[] = await nsSerial.findSendingCards();

		if (novastarCardsList.length > 0) {
			novastarRes.error = 0;
			novastarRes.errorDescription = '';
			novastarRes.sendingCards = await Promise.all(novastarCardsList.map(
				async (nsCard: PortInfo): Promise<SendingCardData> => {
					const nsSession = await openSession(nsCard.path);
					const localRes: SendingCardData = await getNovastarCardData(nsSession);
					localRes.portInfo = nsCard;
					closeSession(nsSession);
					return localRes;
				},
			));
		} else {
			novastarRes.error = 1;
			clog('no novastar cards detected');

			if (emulateTimeoutError) {
				const nsSession = await openSession('COM1');
				const rejTest = await callNovastarSessionFunc(
					nsSession,
					Session.prototype.hasDVISignalIn,
				);
				// eslint-disable-next-line no-console
				console.log(rejTest);
				closeSession(nsSession);
			}
			novastarRes.errorDescription = 'no novastar cards detected';
		}
	} catch (e) {
		novastarRes.error = 3;
		novastarRes.errorDescription = String(e);
	} finally {
		clearNovastarSessions();
	}
	return novastarRes;
}

export async function getNovastarShortCardData(serialPort: string) {
	const shortRes: ShortSendingCardData = {
		error: 1,
		DVI: 0,
		autoBrightness: null,
		screenPorts: [],
	};
	const novastarFullRes = await getNovastarData();
	if (novastarFullRes.sendingCards.length > 0) {
		const cardData: SendingCardData | undefined = novastarFullRes.sendingCards.find(
			(el: SendingCardData) => el.COM === serialPort,
		);
		if (cardData) {
			shortRes.error = cardData.errorCode;
			shortRes.DVI = cardData.DVI ? 1 : 0;
			shortRes.autoBrightness = cardData.autobrightness ? 1 : 0;
			shortRes.screenPorts = cardData.portsData.map((portData): ScreenPortShortData => ({
				portNumber: portData.portNumber,
				active: portData.active ? 1 : 0,
				brightness: portData.brightness,
			}));
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
			error: 2,
			DVI: 0,
			autoBrightness: null,
			screenPorts: [],
		};
	} else {
		result = {
			error: 2,
			errorDescription: errorDescription ?? '',
			sendingCards: [],
		};
	}
	return result;
}
