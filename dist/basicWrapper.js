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
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const connection_1 = require("./connection");
class BasicWrapper {
    constructor(remoteConsole) {
        this.onSystemMessage = console.log;
        this.internal = remoteConsole;
        this.emitter = new events_1.EventEmitter();
        remoteConsole.onMessage = this.handleMessage.bind(this);
    }
    handleMessage(data) {
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
    }
    send(command) {
        return new Promise((resolve, reject) => {
            var id = this.internal.send(command);
            this.emitter.once('CR' + id, resolve);
        });
    }
    subscribe(event, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Subscribing to " + event);
            this.emitter.addListener('SUB' + event, callback);
            var result = yield this.send('websocket subscribe ' + event);
            if (!!result.Exception) {
                console.error(`Failed to subscribe to ${event}`);
                console.error(result.Exception);
            }
            else {
                console.log(`Subscribed to ${event} : ${result.ResultString}`);
            }
            return result;
        });
    }
    unsubscribe(event, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Unsubscribing from " + event);
            this.emitter.removeListener('SUB' + event, callback);
            var result = yield this.send('websocket unsubscribe ' + event);
            if (!!result.Exception) {
                console.error(`Failed to unsubscribe from ${event}`);
                console.error(result.Exception);
            }
            else {
                console.log(`Unsubscribed from ${event} : ${result.ResultString}`);
            }
            return result;
        });
    }
}
exports.default = BasicWrapper;
