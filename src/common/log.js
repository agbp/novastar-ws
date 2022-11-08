"use strict";
exports.__esModule = true;
var env_1 = require("./env");
function clog() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    if (!env_1["default"].silent()) {
        // eslint-disable-next-line no-console
        console.log.apply(console, args);
    }
}
exports["default"] = clog;
