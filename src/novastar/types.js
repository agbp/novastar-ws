"use strict";
exports.__esModule = true;
exports.testCardData = exports.testCardShortData = exports.emptyCardData = exports.emptyScreenPortData = exports.novastarCardPortsAmount = void 0;
var codec_1 = require("@novastar/codec");
var tiny_typed_emitter_1 = require("tiny-typed-emitter");
exports.novastarCardPortsAmount = 4;
exports.emptyScreenPortData = {
    portNumber: null,
    active: false,
    errorCode: 0,
    model: null,
    brightness: null,
    brightnessRGBV: null,
    calibrationMode: null,
    displayMode: null,
    gammaValue: null
};
exports.emptyCardData = {
    errorCode: 0,
    errorDescription: null,
    COM: null,
    version: null,
    DVI: null,
    autobrightness: null,
    portInfo: null,
    portsData: []
};
exports.testCardShortData = {
    error: 3,
    DVI: 1,
    autoBrightness: 0,
    screenPorts: [
        {
            portNumber: 0,
            active: 0,
            brightness: null
        },
        {
            portNumber: 1,
            active: 1,
            brightness: 10
        },
        {
            portNumber: 2,
            active: 0,
            brightness: null
        },
        {
            portNumber: 3,
            active: 0,
            brightness: null
        },
    ]
};
exports.testCardData = {
    error: 3,
    errorDescription: 'no novastar cards detected, TEST_MODE is on, test data added',
    sendingCards: [
        {
            errorCode: 3,
            errorDescription: 'test',
            COM: 'COM1',
            version: 'some version',
            DVI: true,
            autobrightness: false,
            portInfo: {
                path: 'COM1',
                manufacturer: 'some manufacturer',
                serialNumber: 'some serial',
                pnpId: 'some pnpId',
                locationId: 'locationId',
                productId: 'productId',
                vendorId: 'vendorId'
            },
            portsData: [{
                    portNumber: 0,
                    active: true,
                    model: 'some model for test',
                    brightness: 10,
                    brightnessRGBV: {
                        overall: 10,
                        red: 20,
                        green: 20,
                        blue: 20,
                        vRed: 30
                    },
                    calibrationMode: {
                        isOn: true,
                        type: codec_1.Calibration.Brightness
                    },
                    displayMode: codec_1.DisplayMode.Grayscale,
                    errorCode: 3,
                    gammaValue: 10
                }]
        },
    ]
};
