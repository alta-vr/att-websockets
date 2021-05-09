/// <reference types="ws" />
import WebSocket from 'isomorphic-ws';
export declare enum MessageType {
    SystemMessage = "SystemMessage",
    Subscription = "Subscription",
    CommandResult = "CommandResult"
}
export declare type Message = {
    id: number;
    type: MessageType;
    timeStamp: string;
    eventType?: string;
    data: any;
    commandId?: number;
};
export interface AccessProvider {
    serverId: number;
    token: string;
    decoded: any;
    ipAddress: string;
    webserverPort: number;
    websocketPort: number;
    check(): Promise<void>;
}
export declare class JsapiAccessProvider implements AccessProvider {
    serverId: number;
    token: string;
    decoded: any;
    ipAddress: string;
    webserverPort: number;
    websocketPort: number;
    constructor(serverId: number);
    check(): Promise<void>;
}
export default class Connection {
    serverId: number;
    name: string;
    access: AccessProvider;
    connection: WebSocket | undefined;
    onMessage: (response: Message) => void;
    onError: {
        (...data: any[]): void;
        (message?: any, ...optionalParams: any[]): void;
    };
    onClose: {
        (...data: any[]): void;
        (message?: any, ...optionalParams: any[]): void;
    };
    nextSendId: number;
    nextReceiveId: number;
    constructor(id: AccessProvider | number, name: string);
    open(): Promise<void>;
    download(downloadUrl: string): Promise<import("node-fetch").Response>;
    handleMessage(message: any): void;
    send(content: string): number;
    terminate(): void;
}
