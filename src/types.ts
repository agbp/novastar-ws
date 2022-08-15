import { Session } from '@novastar/codec';
import SerialPort, { OpenOptions, PortInfo } from 'serialport';
import { TypedEmitter } from 'tiny-typed-emitter';

export interface SendingCardData {
	COM: string | null,
	Version: string | null,
	DVI: boolean | null,
	Port1: boolean | null,
	Port1Model: string | null,
	Port2: boolean | null,
	Port2Model: string | null,
	ErrorCode: 0 | 1 | 2 | 3,
	ErrorDescription: string | null,
}

export interface ShortCardData {
	Error: 0 | 1 | 2 | 3,
	DVI: 0 | 1,
	Port1: 0 | 1,
	Port2: 0 | 1,
}

export interface NovastarResult {
	Error: boolean | null,
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
