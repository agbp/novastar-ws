"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var env_1 = require("./common/env");
var log_1 = require("./common/log");
var unhandledRejectionHandler_1 = require("./common/unhandledRejectionHandler");
var novastar_1 = require("./novastar/novastar");
var novastarCard_1 = require("./novastar/novastarCard");
var novastarCardPort_1 = require("./novastar/novastarCardPort");
var novastarCommon_1 = require("./novastar/novastarCommon");
var types_1 = require("./novastar/types");
var express = require('express');
(0, unhandledRejectionHandler_1.setUnhandledErrorHandler)();
var app = express();
app.use(express.json());
app.get('/getInfo', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var shortRes;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(req.query && req.query.port && typeof req.query.port === 'string')) return [3 /*break*/, 2];
                return [4 /*yield*/, (0, novastar_1.getNovastarShortCardData)(req.query.port)];
            case 1:
                shortRes = _a.sent();
                return [2 /*return*/, res.status(200).json(shortRes)];
            case 2: return [2 /*return*/, res.status(500).json({ error: 1, errorDescription: 'port not specified, try "/getInfo/?port=SomePortNAme"' })];
        }
    });
}); });
app.get('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var onUnhandlederror, nsSession, localRes, screenPort, nsSession, localRes, nsSession, localRes, shortRes, nsRes, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                onUnhandlederror = function (errorDescription) {
                    var result = (0, novastar_1.defaultErrorResultOnUnhandlederror)(errorDescription, Boolean(req.query && req.query.port));
                    res.status(500).json(result);
                    (0, novastarCommon_1.clearNovastarSessions)();
                };
                _a.label = 1;
            case 1:
                _a.trys.push([1, 14, 15, 16]);
                (0, unhandledRejectionHandler_1.setUnhandledErrorMonitoring)(onUnhandlederror);
                if (!req.query) return [3 /*break*/, 12];
                if (!(req.query.port && typeof req.query.port === 'string')) return [3 /*break*/, 12];
                if (!(req.query.screenPort
                    && typeof req.query.screenPort === 'string')) return [3 /*break*/, 7];
                if (!(req.query.screenPort.toLowerCase() === 'all')) return [3 /*break*/, 4];
                return [4 /*yield*/, (0, novastar_1.openSession)(req.query.port)];
            case 2:
                nsSession = _a.sent();
                return [4 /*yield*/, (0, novastarCardPort_1.setAllPortsBrightness)(nsSession, Number(req.query.setBrightness))];
            case 3:
                localRes = _a.sent();
                (0, novastar_1.closeSession)(nsSession);
                return [2 /*return*/, localRes
                        ? res.status(200).json('success')
                        : res.status(500).json('fault')];
            case 4:
                screenPort = Number(req.query.screenPort);
                if (!(req.query.setBrightness !== undefined)) return [3 /*break*/, 7];
                return [4 /*yield*/, (0, novastar_1.openSession)(req.query.port)];
            case 5:
                nsSession = _a.sent();
                return [4 /*yield*/, (0, novastarCardPort_1.setBrightness)(nsSession, screenPort, Number(req.query.setBrightness))];
            case 6:
                localRes = _a.sent();
                (0, novastar_1.closeSession)(nsSession);
                return [2 /*return*/, localRes
                        ? res.status(200).json('success')
                        : res.status(500).json('fault')];
            case 7:
                if (!(req.query.setAutoBrightness
                    && typeof req.query.setAutoBrightness === 'string'
                    && (req.query.setAutoBrightness === '1' || req.query.setAutoBrightness === '0'))) return [3 /*break*/, 10];
                return [4 /*yield*/, (0, novastar_1.openSession)(req.query.port)];
            case 8:
                nsSession = _a.sent();
                return [4 /*yield*/, (0, novastarCard_1.setAutoBrightness)(nsSession, req.query.setAutoBrightness === '1')];
            case 9:
                localRes = _a.sent();
                (0, novastar_1.closeSession)(nsSession);
                return [2 /*return*/, localRes
                        ? res.status(200).json('success')
                        : res.status(500).json('fault')];
            case 10: return [4 /*yield*/, (0, novastar_1.getNovastarShortCardData)(req.query.port)];
            case 11:
                shortRes = _a.sent();
                return [2 /*return*/, res.status(200).json(shortRes)];
            case 12: return [4 /*yield*/, (0, novastar_1.getNovastarData)()];
            case 13:
                nsRes = _a.sent();
                if (nsRes.sendingCards.length <= 0 && env_1["default"].test()) {
                    return [2 /*return*/, res.status(200).json(types_1.testCardData)];
                }
                return [2 /*return*/, res.status(200).json(nsRes)];
            case 14:
                e_1 = _a.sent();
                return [2 /*return*/, res.status(500).json(e_1)];
            case 15:
                (0, novastarCommon_1.clearNovastarSessions)();
                (0, unhandledRejectionHandler_1.dismissUnhandledErrorMonitoring)();
                return [7 /*endfinally*/];
            case 16: return [2 /*return*/];
        }
    });
}); });
try {
    app.listen(env_1["default"].port(), function () {
        (0, log_1["default"])("Server started on port ".concat(env_1["default"].port()));
        (0, log_1["default"])('Monitoring novastar devices web service - https://github.com/agbp/novastar-ws');
        (0, log_1["default"])('usage: ');
        (0, log_1["default"])('nowastar-ws-win.exe [port:5000] [silent] [test]');
        if (env_1["default"].test()) {
            (0, log_1["default"])('TEST_MODE is on');
        }
    });
}
catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
}
