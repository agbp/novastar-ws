"use strict";
exports.__esModule = true;
exports.dismissUnhandledErrorMonitoring = exports.setUnhandledErrorMonitoring = exports.setUnhandledErrorHandler = void 0;
var log_1 = require("./log");
var unhandledError = {
    unhandlederrorHandlerIsActive: false,
    error: false,
    errorDescription: '',
    promise: null,
    reason: null,
    monitoringInterval: null
};
function clearUnhandledErrorMonitorInterval() {
    if (unhandledError.monitoringInterval) {
        clearInterval(unhandledError.monitoringInterval);
        unhandledError.monitoringInterval = null;
    }
}
function clearUnhandledErrorFlags() {
    unhandledError.error = false;
    unhandledError.errorDescription = '';
    unhandledError.promise = null;
    unhandledError.reason = null;
}
function setUnhandledErrorHandler(onError, clear, clearInterval) {
    if (clear === void 0) { clear = false; }
    if (clearInterval === void 0) { clearInterval = false; }
    process.on('unhandledRejection', function (reason, promise) {
        (0, log_1["default"])('Unhandled Rejection at:', promise, 'reason:', reason);
        unhandledError.error = true;
        unhandledError.promise = promise;
        unhandledError.reason = reason;
        if (reason) {
            if (reason instanceof Error && reason.stack) {
                unhandledError.errorDescription = reason.stack;
            }
            else {
                unhandledError.errorDescription = String(reason);
            }
        }
        if (onError) {
            onError(unhandledError.errorDescription);
        }
        if (clear) {
            clearUnhandledErrorFlags();
        }
        if (clearInterval) {
            clearUnhandledErrorMonitorInterval();
        }
    });
    unhandledError.unhandlederrorHandlerIsActive = true;
}
exports.setUnhandledErrorHandler = setUnhandledErrorHandler;
function setUnhandledErrorMonitoring(callback, clearInterval, clearErrorFlags, intervalMs) {
    if (clearInterval === void 0) { clearInterval = true; }
    if (clearErrorFlags === void 0) { clearErrorFlags = true; }
    if (intervalMs === void 0) { intervalMs = 1000; }
    if (!unhandledError.unhandlederrorHandlerIsActive) {
        throw new Error('You should call "setUnhandledErrorHandler" before "setUnhandledErrorMonitoring"');
    }
    unhandledError.monitoringInterval = setInterval(function () {
        if (unhandledError.error) {
            callback(unhandledError.errorDescription);
            if (clearErrorFlags) {
                clearUnhandledErrorFlags();
            }
            if (clearInterval) {
                clearUnhandledErrorMonitorInterval();
            }
        }
    }, intervalMs);
    return unhandledError.monitoringInterval;
}
exports.setUnhandledErrorMonitoring = setUnhandledErrorMonitoring;
function dismissUnhandledErrorMonitoring() {
    clearUnhandledErrorMonitorInterval();
}
exports.dismissUnhandledErrorMonitoring = dismissUnhandledErrorMonitoring;
