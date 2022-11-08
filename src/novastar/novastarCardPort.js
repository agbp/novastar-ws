"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.setAllPortsBrightness = exports.setBrightness = exports.getSendingCardPortsInfo = void 0;
var codec_1 = require("@novastar/codec");
var novastarCommon_1 = require("./novastarCommon");
var types_1 = require("./types");
function getSendingCardPortInfo(nsSession, portNum) {
    return __awaiter(this, void 0, void 0, function () {
        var res, _a, functionsToCAll, arrayRes;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    res = __assign(__assign({}, types_1.emptyScreenPortData), { portNumber: portNum });
                    _a = res;
                    return [4 /*yield*/, (0, novastarCommon_1.callNovastarSessionFunc)(nsSession, codec_1.Session.prototype.getModel, codec_1.DeviceType.ReceivingCard, portNum, 0)];
                case 1:
                    _a.model = _b.sent();
                    if (res.model === null)
                        return [2 /*return*/, res];
                    res.active = true;
                    functionsToCAll = [
                        codec_1.Session.prototype.getBrightness,
                        codec_1.Session.prototype.getBrightnessRGBV,
                        codec_1.Session.prototype.getCalibrationMode,
                        codec_1.Session.prototype.getDisplayMode,
                        codec_1.Session.prototype.getGammaValue,
                    ];
                    return [4 /*yield*/, Promise.all(functionsToCAll.map(function (f) { return (0, novastarCommon_1.callNovastarSessionFunc)(nsSession, f, portNum); }))];
                case 2:
                    arrayRes = _b.sent();
                    res.brightness = arrayRes[0], res.brightnessRGBV = arrayRes[1], res.calibrationMode = arrayRes[2], res.displayMode = arrayRes[3], res.gammaValue = arrayRes[4];
                    return [2 /*return*/, res];
            }
        });
    });
}
function getSendingCardPortsInfo(nsSession) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // const res: ScreenPortData[] = [];
            return [2 /*return*/, Promise.all(Array.from(Array(types_1.novastarCardPortsAmount).keys())
                    .map(function (i) { return getSendingCardPortInfo(nsSession, i); }))];
        });
    });
}
exports.getSendingCardPortsInfo = getSendingCardPortsInfo;
function setBrightness(nsSession, portNum, brightnessValue) {
    return __awaiter(this, void 0, void 0, function () {
        var actualBrightness;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, novastarCommon_1.callNovastarSessionFunc)(nsSession, codec_1.Session.prototype.setBrightness, brightnessValue, portNum)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, novastarCommon_1.callNovastarSessionFunc)(nsSession, codec_1.Session.prototype.getBrightness, portNum)];
                case 2:
                    actualBrightness = _a.sent();
                    return [2 /*return*/, actualBrightness === brightnessValue];
            }
        });
    });
}
exports.setBrightness = setBrightness;
function setAllPortsBrightness(nsSession, brightnessValue) {
    return __awaiter(this, void 0, void 0, function () {
        var portsInfo, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getSendingCardPortsInfo(nsSession)];
                case 1: return [4 /*yield*/, (_a.sent())
                        .filter(function (portInfo) { return portInfo.active; })];
                case 2:
                    portsInfo = _a.sent();
                    return [4 /*yield*/, Promise.all(portsInfo.map(function (portInfo) { return setBrightness(nsSession, portInfo.portNumber, brightnessValue); }))];
                case 3:
                    res = _a.sent();
                    return [2 /*return*/, !res.includes(false)];
            }
        });
    });
}
exports.setAllPortsBrightness = setAllPortsBrightness;
