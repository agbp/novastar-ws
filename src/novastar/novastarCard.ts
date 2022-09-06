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
		const arrayRes = await Promise.all([
			callNovastarSessionFunc(
				nsSession,
				Session.prototype.hasDVISignalIn,
			),
			callNovastarSessionFunc(
				nsSession,
				Session.prototype.getSendingCardVersion,
			),
			callNovastarSessionFunc(
				nsSession,
				Session.prototype.getAutobrightnessMode,
			),
			getSendingCardPortsInfo(nsSession),
		]);
		[res.DVI, res.version, res.autobrightness, res.portsData] = arrayRes;
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
