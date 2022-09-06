import { Request, Response } from 'express';
import appEnv from './common/env';
import clog from './common/log';
import {
	dismissUnhandledErrorMonitoring,
	setUnhandledErrorHandler,
	setUnhandledErrorMonitoring,
} from './common/unhandledRejectionHandler';
import {
	closeSession,
	defaultErrorResultOnUnhandlederror,
	getNovastarData,
	getNovastarShortCardData,
	openSession,
} from './novastar/novastar';
import { setAutoBrightness } from './novastar/novastarCard';
import { setAllPortsBrightness, setBrightness } from './novastar/novastarCardPort';
import { clearNovastarSessions } from './novastar/novastarCommon';
import { NovastarCardPortNum, NovastarSession, testCardData } from './novastar/types';

const express = require('express');

setUnhandledErrorHandler();
const app = express();
app.use(express.json());

app.get('/getInfo', async (req: Request, res: Response) => {
	if (req.query && req.query.port && typeof req.query.port === 'string') {
		const shortRes = await getNovastarShortCardData(req.query.port);
		return res.status(200).json(shortRes);
	}
	return res.status(500).json({ error: 1, errorDescription: 'port not specified, try "/getInfo/?port=SomePortNAme"' });
});

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
				if (req.query.screenPort
					&& typeof req.query.screenPort === 'string'
				) {
					if (req.query.screenPort.toLowerCase() === 'all') {
						const nsSession: NovastarSession = await openSession(req.query.port);
						const localRes = await setAllPortsBrightness(
							nsSession,
							Number(req.query.setBrightness),
						);
						closeSession(nsSession);
						return localRes
							? res.status(200).json('success')
							: res.status(500).json('fault');
					}
					const screenPort = Number(req.query.screenPort) as NovastarCardPortNum;
					if (req.query.setBrightness !== undefined) {
						const nsSession: NovastarSession = await openSession(req.query.port);
						const localRes = await setBrightness(
							nsSession,
							screenPort,
							Number(req.query.setBrightness),
						);
						closeSession(nsSession);
						return localRes
							? res.status(200).json('success')
							: res.status(500).json('fault');
					}
				}
				if (req.query.setAutoBrightness
					&& typeof req.query.setAutoBrightness === 'string'
					&& (req.query.setAutoBrightness === '1' || req.query.setAutoBrightness === '0')
				) {
					const nsSession: NovastarSession = await openSession(req.query.port);
					const localRes = await setAutoBrightness(
						nsSession,
						req.query.setAutoBrightness === '1',
					);
					closeSession(nsSession);
					return localRes
						? res.status(200).json('success')
						: res.status(500).json('fault');
				}
				const shortRes = await getNovastarShortCardData(req.query.port);
				return res.status(200).json(shortRes);
			}
		}
		const nsRes = await getNovastarData();
		if (nsRes.sendingCards.length <= 0 && appEnv.test()) {
			return res.status(200).json(testCardData);
		}
		return res.status(200).json(nsRes);
	} catch (e) {
		return res.status(500).json(e);
	} finally {
		clearNovastarSessions();
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
