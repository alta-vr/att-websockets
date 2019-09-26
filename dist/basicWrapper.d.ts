/// <reference types="node" />
import { EventEmitter } from "events";
import Connection, { Message } from "./connection";
export default class BasicWrapper {
    emitter: EventEmitter;
    internal: Connection;
    onSystemMessage: (message: Message) => void;
    constructor(remoteConsole: Connection);
    handleMessage(data: Message): void;
    send(command: string): Promise<any>;
    subscribe(event: string, callback: (result: any) => void): Promise<any>;
    unsubscribe(event: string, callback: (result: any) => void): Promise<any>;
}
