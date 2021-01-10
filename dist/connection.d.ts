/// <reference types="ws" />
import WebSocket from 'isomorphic-ws';
export declare enum MessageType {
    SystemMessage = "SystemMessage",
    Subscription = "Subscription",
    CommandResult = "CommandResult"
}
export declare type Message = {
    type: MessageType;
    timeStamp: string;
    eventType?: string;
    data: any;
    commandId?: number;
};
export default class Connection {
    name: string;
    connection: WebSocket | undefined;
    onMessage: (response: Message) => void;
    onError: {
        (message?: any, ...optionalParams: any[]): void;
        (message?: any, ...optionalParams: any[]): void;
    };
    onClose: {
        (message?: any, ...optionalParams: any[]): void;
        (message?: any, ...optionalParams: any[]): void;
    };
    nextId: number;
    constructor(name: string);
    connect(ipAddress: string, port: string | number, token: string): Promise<void>;
    handleMessage(message: any): void;
    getNextId(): number;
    send(content: string): number;
    terminate(): void;
}
