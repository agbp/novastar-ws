"use strict";
exports.__esModule = true;
var dotenv = require('dotenv');
function argsCheck(args, keyword) {
    var lcKeyword = keyword.toLowerCase();
    return Boolean(args.find(function (el) { return el.toLowerCase() === lcKeyword; }));
}
function getTestModeFromArgs(args) {
    return argsCheck(args, 'test') || process.env.TEST_MODE === 'true';
}
function getSilentModeFromArgs(args) {
    return argsCheck(args, 'silent') || process.env.CONSOLE_LOG !== 'true';
}
function getemulateTimeoutErrorFromArgs(args) {
    return argsCheck(args, 'emulatetimeouterror');
}
function getListeningPortFromArgs(args) {
    var portArg = args.find(function (el) { return el.toLowerCase().startsWith('port:'); });
    if (portArg) {
        var numPort = Number(portArg.slice(5));
        if (numPort !== 0)
            return numPort;
    }
    return Number(process.env.PORT) || 5000;
}
function appEnvInit(args) {
    return {
        silent: getSilentModeFromArgs(args),
        test: getTestModeFromArgs(args),
        port: getListeningPortFromArgs(args),
        emulateTimeoutError: getemulateTimeoutErrorFromArgs(args)
    };
}
dotenv.config();
var appEnvStore = appEnvInit(process.argv.slice(2));
var appEnv = {
    silent: function (aEnv) {
        if (aEnv === void 0) { aEnv = appEnvStore; }
        return aEnv.silent;
    },
    test: function (aEnv) {
        if (aEnv === void 0) { aEnv = appEnvStore; }
        return aEnv.test;
    },
    port: function (aEnv) {
        if (aEnv === void 0) { aEnv = appEnvStore; }
        return aEnv.port;
    },
    emulateTimeoutError: function (aEnv) {
        if (aEnv === void 0) { aEnv = appEnvStore; }
        return aEnv.emulateTimeoutError;
    }
};
exports["default"] = appEnv;
