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
exports.JsapiAccessProvider = exports.MessageType = void 0;
const isomorphic_ws_1 = __importDefault(require("isomorphic-ws"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const node_fetch_1 = __importDefault(require("node-fetch"));
try {
    var fetch = node_fetch_1.default.bind(window);
}
catch (_a) {
    var fetch = node_fetch_1.default;
}
var MessageType;
(function (MessageType) {
    MessageType["SystemMessage"] = "SystemMessage";
    MessageType["Subscription"] = "Subscription";
    MessageType["CommandResult"] = "CommandResult";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
class ConnectionError extends Error {
    constructor(message, details) {
        super(message);
        this.details = details;
    }
}
class JsapiAccessProvider {
    constructor(serverId, serversModule) {
        this.token = '';
        this.decoded = null;
        this.ipAddress = '127.0.0.1';
        this.webserverPort = 1760;
        this.websocketPort = 1761;
        this.serverId = serverId;
        this.serversModule = serversModule;
    }
    check() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.decoded || this.decoded.exp - new Date().getTime() / 1000 < 15) {
                var details = yield this.serversModule.joinConsole(this.serverId, false);
                if (details.allowed) {
                    this.ipAddress = details.connection.address || this.ipAddress;
                    this.websocketPort = details.connection.websocket_port || this.websocketPort;
                    this.webserverPort = details.connection.webserver_port || this.webserverPort;
                    this.token = details.token;
                    this.decoded = jsonwebtoken_1.default.decode(this.token);
                }
                else {
                    throw new ConnectionError("Connection rejected", details);
                }
            }
        });
    }
}
exports.JsapiAccessProvider = JsapiAccessProvider;
class Connection {
    constructor(access, name) {
        this.onMessage = console.log;
        this.onError = console.error;
        this.onClose = console.error;
        this.nextSendId = 0;
        this.nextReceiveId = 0;
        this.serverId = access.serverId;
        this.access = access;
        this.name = name;
    }
    open() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.access.check();
            var { ipAddress, websocketPort, token } = this.access;
            console.log(`Connecting to ${ipAddress}:${websocketPort}`);
            const connection = new isomorphic_ws_1.default(`ws://${ipAddress}:${websocketPort}`);
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
    download(downloadUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.access.check();
            var { ipAddress, webserverPort, token, decoded } = this.access;
            return yield fetch(`http://${ipAddress}:${webserverPort}/output/${decoded.UserId}/${downloadUrl}`, { headers: { "Authorization": `Bearer ${token}` } });
        });
    }
    handleMessage(message) {
        var data = JSON.parse(message.data);
        data.id = this.nextReceiveId++;
        if (data.type == MessageType.CommandResult && !!data.data.Result && !!data.data.Result.downloadUrl) {
            let file = data.data.Result.downloadUrl;
            data.data.download = () => this.download(file);
        }
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
