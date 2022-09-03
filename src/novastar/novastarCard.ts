import {
	Session,
} from '@novastar/codec';

import { getSendingCardPortsInfo } from './novastarCardPort';
import { callNovastarSessionFunc } from './novastarCommon';
import {
	emptyCardData,
	NovastarSession,
	SendingCardData,
} from './types';

export async function getNovastarCardData(
	nsSession: NovastarSession,
): Promise<SendingCardData> {
	const res: SendingCardData = { ...emptyCardData, COM: nsSession.serialPortPath ?? null };
	try {
		res.DVI = await callNovastarSessionFunc(
			nsSession,
			Session.prototype.hasDVISignalIn,
		);
		res.version = await callNovastarSessionFunc(
			nsSession,
			Session.prototype.getSendingCardVersion,
		);
		res.autobrightness = await callNovastarSessionFunc(
			nsSession,
			Session.prototype.getAutobrightnessMode,
		);
		res.portsData = await getSendingCardPortsInfo(nsSession);
	} catch (e) {
		res.errorCode = 1;
		res.errorDescription = String(e);
	}
	return res;
}

export async function setAutoBrightness(
	nsSession: NovastarSession,
	autoBrightnessMode: boolean = true,
): Promise<boolean> {
	try {
		await callNovastarSessionFunc(
			nsSession,
			Session.prototype.setAutobrightnessMode,
			autoBrightnessMode,
		);
		const actualAutoBrightnessMode = await callNovastarSessionFunc(
			nsSession,
			Session.prototype.getAutobrightnessMode,
		);
		return actualAutoBrightnessMode === autoBrightnessMode;
	} catch (e) {
		return false;
	}
}
