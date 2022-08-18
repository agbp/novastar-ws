import {
	BrightnessRGBV,
	Calibration,
	DisplayMode,
	Session,
} from '@novastar/codec';
import SerialPort, { OpenOptions, PortInfo } from 'serialport';
import { TypedEmitter } from 'tiny-typed-emitter';

export type NovastarCardPortNum = 0 | 1 | 2 | 3;
export type ErrorCode = 0 | 1 | 2 | 3;

export interface CalibrationMode {
	isOn: boolean,
	type: Calibration,
}

export interface SendingCardPortData {
	portNumber: NovastarCardPortNum,
	errorCode: ErrorCode,
	model: string | null,
	brightness: number | null,
	brightnessRGBV: BrightnessRGBV | null,
	gammaValue: number | null,
	displayMode: DisplayMode | null,
	calibrationMode: CalibrationMode | null,
}

export interface SendingCardData {
	errorCode: ErrorCode,
	errorDescription: string | null,
	COM: string | null,
	version: string | null,
	DVI: boolean | null,
	autobrightness: boolean | null,
	portInfo: PortInfo | null,
	portsData: SendingCardPortData[],
}

export interface ShortSendingCardData {
	Error: ErrorCode,
	DVI: 0 | 1,
	Port1: 0 | 1,
	Port2: 0 | 1,
}

export interface NovastarReqResult {
	Error: ErrorCode,
	ErrorDescription: string | null,
	SendingCards: SendingCardData[],
}

interface SerialBindingEvents {
	open(path: string): void;
	close(path: string): void;
}
export declare class SerialBinding extends TypedEmitter<SerialBindingEvents> {
	private sessions;

	findSendingCards: () => Promise<PortInfo[]>;
	open(path: string, openOptions?: OpenOptions): Promise<Session<SerialPort>>;
	close(path: string): boolean;
	getSessions(): Session<SerialPort>[];
}
