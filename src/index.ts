import { Request, Response } from 'express';
import appEnv from './common/env';
import clog from './common/log';
import {
	dismissUnhandledErrorMonitoring,
	setUnhandledErrorHandler,
	setUnhandledErrorMonitoring,
} from './common/unhandledRejectionHandler';
import {
	defaultErrorResultOnUnhandlederror,
	getNovastarData,
	getNovastarShortCardData,
} from './novastar/novastar';
import { getTestCardData } from './novastar/novastarCard';
import { clearNovastarSessions } from './novastar/novastarCommon';
import { testEdge } from './novastar/sdk';

const express = require('express');

testEdge();

setUnhandledErrorHandler();
const app = express();
app.use(express.json());
app.get('/', async (req: Request, res: Response) => {
	const onUnhandlederror = (errorDescription?: string) => {
		const result = defaultErrorResultOnUnhandlederror(
			errorDescription,
			Boolean(req.query && req.query.port),
		);
		res.status(500).json(result);
		clearNovastarSessions();
	};

	try {
		setUnhandledErrorMonitoring(onUnhandlederror);
		if (req.query) {
			if (req.query.port && typeof req.query.port === 'string') {
				const shortRes = await getNovastarShortCardData(req.query.port);
				return res.status(200).json(shortRes);
			}
			if (req.query.setBrightness) {
				clog('setBrightness');
				res.status(200).json('setBrightness request');
			}
		}
		const nsRes = await getNovastarData();
		if (nsRes.SendingCards.length <= 0 && appEnv.test()) {
			return res.status(200).json(getTestCardData());
		}
		return res.status(200).json(nsRes);
	} catch (e) {
		return res.status(500).json(e);
	} finally {
		dismissUnhandledErrorMonitoring();
	}
});

try {
	app.listen(appEnv.port(), () => {
		clog(`Server started on port ${appEnv.port()}`);
		clog('Monitoring novastar devices web service - https://github.com/agbp/novastar-ws');
		clog('usage: ');
		clog('nowastar-ws-win.exe [port:5000] [silent] [test]');
		if (appEnv.test()) {
			clog('TEST_MODE is on');
		}
	});
} catch (e) {
	// eslint-disable-next-line no-console
	console.log(e);
}
