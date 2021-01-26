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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const isomorphic_ws_1 = __importDefault(require("isomorphic-ws"));
var MessageType;
(function (MessageType) {
    MessageType["SystemMessage"] = "SystemMessage";
    MessageType["Subscription"] = "Subscription";
    MessageType["CommandResult"] = "CommandResult";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
class Connection {
    constructor(name) {
        this.onMessage = console.log;
        this.onError = console.error;
        this.onClose = console.error;
        this.nextSendId = 0;
        this.nextReceiveId = 0;
        this.name = name;
    }
    connect(ipAddress, port, token) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Connecting to ${ipAddress}:${port}`);
            const connection = new isomorphic_ws_1.default(`ws://${ipAddress}:${port}`);
            this.connection = connection;
            yield new Promise((resolve, reject) => {
                connection.onopen = () => {
                    connection.onmessage = (message) => {
                        var data = JSON.parse(message.data);
                        if (data.type == 'FatalLog' || data.type == 'ErrorLog') {
                            console.error("Failing connection!");
                            console.error(message);
                            reject(data.data);
                        }
                        else {
                            console.log("Resolving connection!");
                            console.log(data.data);
                            resolve();
                        }
                    };
                    connection.send(token);
                };
                connection.onerror = reject;
            });
            connection.onmessage = this.handleMessage.bind(this);
            connection.onerror = (error) => this.onError(error);
            connection.onclose = (data) => this.onClose(data);
        });
    }
    handleMessage(message) {
        var data = JSON.parse(message.data);
        data.id = this.nextReceiveId++;
        this.onMessage(data);
    }
    send(content) {
        if (!this.connection) {
            console.error("Connection not started. Call 'connect' first!");
            return -1;
        }
        var id = this.nextSendId++;
        this.connection.send(JSON.stringify({ id, content }));
        return id;
    }
    terminate() {
        try {
            if (!!this.connection) {
                this.connection.close();
            }
        }
        catch (error) {
            console.log(`Error destroying connection : ${error}`);
        }
    }
}
exports.default = Connection;
