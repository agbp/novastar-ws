import {
	BrightnessRGBV,
	Calibration,
	DisplayMode,
	Session,
} from '@novastar/codec';
import SerialPort, { OpenOptions, PortInfo } from 'serialport';
import { TypedEmitter } from 'tiny-typed-emitter';

export type NovastarCardPortNum = 0 | 1 | 2 | 3 | null;
export const novastarCardPortsAmount = 4;
export type ErrorCode = 0 | 1 | 2 | 3;

export interface NovastarSession {
	session: Session<SerialPort>,
	serialPortPath: string,
}

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

export const emptySendingCardPortData: SendingCardPortData = {
	portNumber: null,
	errorCode: 0,
	model: null,
	brightness: null,
	brightnessRGBV: null,
	calibrationMode: null,
	displayMode: null,
	gammaValue: null,
};

export const emptyCardData: SendingCardData = {
	errorCode: 0,
	errorDescription: null,
	COM: null,
	version: null,
	DVI: null,
	autobrightness: null,
	portInfo: null,
	portsData: [],
};

export const testCardShortData: ShortSendingCardData = {
	Error: 3,
	DVI: 1,
	Port1: 0,
	Port2: 1,
};

export const testCardData: NovastarReqResult = {
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
