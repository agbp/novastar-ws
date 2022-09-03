import {
	Session,
} from '@novastar/codec';
import SerialPort from 'serialport';
import { NovastarSession, SerialBinding } from './types';

const serial = require('@novastar/serial');

export const novastarSerial: SerialBinding = serial.default;

export function clearNovastarSessions(nsSerial: SerialBinding = novastarSerial) {
	const sessions: Session<SerialPort>[] = nsSerial.getSessions();
	sessions.forEach((session) => session.close());
}

export async function callNovastarSessionFunc(
	nsSession: NovastarSession,
	func: (...fargs: any) => Promise<any>,
	...args: any
): Promise<any> {
	try {
		const res = await func.apply(nsSession.session, args);
		return res;
	} catch (e) {
		return null;
	}
}
