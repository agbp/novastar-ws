export interface SendingCardData {
	COM: string | null,
	Version: string | null,
	DVI: boolean | null,
	Port1: boolean | null,
	Port1Model: string | null,
	Port2: boolean | null,
	Port2Model: string | null,
	Error: boolean | null,
	ErrorDescription: string | null,
}

export interface ShortCardData {
	Error: 0 | 1,
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
