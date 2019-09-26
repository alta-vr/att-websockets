/// <reference types="node" />
import { EventEmitter } from "events";
import Connection, { EventType, Message } from "./connection";
export default class BasicWrapper {
    emitter: EventEmitter;
    internal: Connection;
    onSystemMessage: (message: Message) => void;
    constructor(remoteConsole: Connection);
    handleMessage(data: Message): void;
    send(command: string): Promise<any>;
    subscribe(event: EventType, callback: (result: any) => void): Promise<any>;
    unsubscribe(event: EventType, callback: (result: any) => void): Promise<any>;
}
