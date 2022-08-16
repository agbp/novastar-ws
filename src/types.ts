import {
	BrightnessRGBV,
	Calibration,
	DisplayMode,
	Session,
} from '@novastar/codec';
import SerialPort, { OpenOptions, PortInfo } from 'serialport';
import { TypedEmitter } from 'tiny-typed-emitter';

export interface CalibrationMode {
	isOn: boolean,
	type: Calibration,
}

export interface SendingCardPortData {
	portNumber: 0 | 1 | 2 | 3,
	errorCode: 0 | 1 | 2 | 3,
	model: string | null,
	brightness: number | null,
	brightnessRGBV: BrightnessRGBV | null,
	gammaValue: number | null,
	displayMode: DisplayMode | null,
	calibrationMode: CalibrationMode | null,
}

export interface SendingCardData {
	errorCode: 0 | 1 | 2 | 3,
	errorDescription: string | null,
	COM: string | null,
	version: string | null,
	DVI: boolean | null,
	autobrightness: boolean | null,
	portData: SendingCardPortData[],
}

export interface ShortCardData {
	Error: 0 | 1 | 2 | 3,
	DVI: 0 | 1,
	Port1: 0 | 1,
	Port2: 0 | 1,
}

export interface NovastarResult {
	Error: 0 | 1 | 2 | 3 | null,
	ErrorDescription: string | null,
	SendingCards: SendingCardData[],
}

export interface TimeOutErrorInterface {
	error: boolean,
	errorDescription: string,
	promise: Promise<any> | null,
	reason: any,
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
