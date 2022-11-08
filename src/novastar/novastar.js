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
exports.defaultErrorResultOnUnhandlederror = exports.getNovastarShortCardData = exports.getNovastarData = exports.closeSession = exports.openSession = void 0;
var codec_1 = require("@novastar/codec");
var env_1 = require("../common/env");
var log_1 = require("../common/log");
var novastarCard_1 = require("./novastarCard");
var novastarCommon_1 = require("./novastarCommon");
function openSession(serialPortPath, nsSerial) {
    if (nsSerial === void 0) { nsSerial = novastarCommon_1.novastarSerial; }
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = {};
                    return [4 /*yield*/, nsSerial.open(serialPortPath)];
                case 1: return [2 /*return*/, (_a.session = _b.sent(), _a.serialPortPath = serialPortPath, _a)];
            }
        });
    });
}
exports.openSession = openSession;
function closeSession(nsSession) {
    return nsSession.session.close();
}
exports.closeSession = closeSession;
function getNovastarData(nsSerial, emulateTimeoutError) {
    if (nsSerial === void 0) { nsSerial = novastarCommon_1.novastarSerial; }
    if (emulateTimeoutError === void 0) { emulateTimeoutError = env_1["default"].emulateTimeoutError(); }
    return __awaiter(this, void 0, void 0, function () {
        var novastarRes, novastarCardsList, _a, nsSession, rejTest, e_1;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    novastarRes = {
                        error: 1,
                        errorDescription: null,
                        sendingCards: []
                    };
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 9, 10, 11]);
                    return [4 /*yield*/, nsSerial.findSendingCards()];
                case 2:
                    novastarCardsList = _b.sent();
                    if (!(novastarCardsList.length > 0)) return [3 /*break*/, 4];
                    novastarRes.error = 0;
                    novastarRes.errorDescription = '';
                    _a = novastarRes;
                    return [4 /*yield*/, Promise.all(novastarCardsList.map(function (nsCard) { return __awaiter(_this, void 0, void 0, function () {
                            var nsSession, localRes;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, openSession(nsCard.path)];
                                    case 1:
                                        nsSession = _a.sent();
                                        return [4 /*yield*/, (0, novastarCard_1.getNovastarCardData)(nsSession)];
                                    case 2:
                                        localRes = _a.sent();
                                        localRes.portInfo = nsCard;
                                        closeSession(nsSession);
                                        return [2 /*return*/, localRes];
                                }
                            });
                        }); }))];
                case 3:
                    _a.sendingCards = _b.sent();
                    return [3 /*break*/, 8];
                case 4:
                    novastarRes.error = 1;
                    (0, log_1["default"])('no novastar cards detected');
                    if (!emulateTimeoutError) return [3 /*break*/, 7];
                    return [4 /*yield*/, openSession('COM1')];
                case 5:
                    nsSession = _b.sent();
                    return [4 /*yield*/, (0, novastarCommon_1.callNovastarSessionFunc)(nsSession, codec_1.Session.prototype.hasDVISignalIn)];
                case 6:
                    rejTest = _b.sent();
                    // eslint-disable-next-line no-console
                    console.log(rejTest);
                    closeSession(nsSession);
                    _b.label = 7;
                case 7:
                    novastarRes.errorDescription = 'no novastar cards detected';
                    _b.label = 8;
                case 8: return [3 /*break*/, 11];
                case 9:
                    e_1 = _b.sent();
                    novastarRes.error = 3;
                    novastarRes.errorDescription = String(e_1);
                    return [3 /*break*/, 11];
                case 10:
                    (0, novastarCommon_1.clearNovastarSessions)();
                    return [7 /*endfinally*/];
                case 11: return [2 /*return*/, novastarRes];
            }
        });
    });
}
exports.getNovastarData = getNovastarData;
function getNovastarShortCardData(serialPort) {
    return __awaiter(this, void 0, void 0, function () {
        var shortRes, novastarFullRes, cardData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    shortRes = {
                        error: 1,
                        DVI: 0,
                        autoBrightness: null,
                        screenPorts: []
                    };
                    return [4 /*yield*/, getNovastarData()];
                case 1:
                    novastarFullRes = _a.sent();
                    if (novastarFullRes.sendingCards.length > 0) {
                        cardData = novastarFullRes.sendingCards.find(function (el) { return el.COM === serialPort; });
                        if (cardData) {
                            shortRes.error = cardData.errorCode;
                            shortRes.DVI = cardData.DVI ? 1 : 0;
                            shortRes.autoBrightness = cardData.autobrightness ? 1 : 0;
                            shortRes.screenPorts = cardData.portsData.map(function (portData) { return ({
                                portNumber: portData.portNumber,
                                active: portData.active ? 1 : 0,
                                brightness: portData.brightness
                            }); });
                        }
                    }
                    return [2 /*return*/, shortRes];
            }
        });
    });
}
exports.getNovastarShortCardData = getNovastarShortCardData;
function defaultErrorResultOnUnhandlederror(errorDescription, short) {
    if (short === void 0) { short = false; }
    var result;
    if (short) {
        result = {
            error: 2,
            DVI: 0,
            autoBrightness: null,
            screenPorts: []
        };
    }
    else {
        result = {
            error: 2,
            errorDescription: errorDescription !== null && errorDescription !== void 0 ? errorDescription : '',
            sendingCards: []
        };
    }
    return result;
}
exports.defaultErrorResultOnUnhandlederror = defaultErrorResultOnUnhandlederror;
