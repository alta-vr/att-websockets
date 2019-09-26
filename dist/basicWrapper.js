"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
var connection_1 = require("./connection");
var BasicWrapper = /** @class */ (function () {
    function BasicWrapper(remoteConsole) {
        this.onSystemMessage = console.log;
        this.internal = remoteConsole;
        this.emitter = new events_1.EventEmitter();
        remoteConsole.onMessage = this.handleMessage.bind(this);
    }
    BasicWrapper.prototype.handleMessage = function (data) {
        switch (data.type) {
            case connection_1.MessageType.SystemMessage:
                this.onSystemMessage(data);
                break;
            case connection_1.MessageType.Subscription:
                this.emitter.emit('SUB' + data.eventType, data.data);
                break;
            case connection_1.MessageType.CommandResult:
                this.emitter.emit('CR' + data.commandId, data.data);
                break;
            default:
                console.log("Unhandled message:");
                console.log(data);
                break;
        }
    };
    BasicWrapper.prototype.send = function (command) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var id = _this.internal.send(command);
            _this.emitter.once('CR' + id, resolve);
        });
    };
    BasicWrapper.prototype.subscribe = function (event, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Subscribing to " + event);
                        this.emitter.addListener('SUB' + event, callback);
                        return [4 /*yield*/, this.send('websocket subscribe ' + event)];
                    case 1:
                        result = _a.sent();
                        if (!!result.Exception) {
                            console.error("Failed to subscribe to " + event);
                            console.error(result.Exception);
                        }
                        else {
                            console.log("Subscribed to " + event + " : " + result.ResultString);
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    };
    BasicWrapper.prototype.unsubscribe = function (event, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Unsubscribing from " + event);
                        this.emitter.removeListener('SUB' + event, callback);
                        return [4 /*yield*/, this.send('websocket unsubscribe ' + event)];
                    case 1:
                        result = _a.sent();
                        if (!!result.Exception) {
                            console.error("Failed to unsubscribe from " + event);
                            console.error(result.Exception);
                        }
                        else {
                            console.log("Unsubscribed from " + event + " : " + result.ResultString);
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    };
    return BasicWrapper;
}());
exports.default = BasicWrapper;
