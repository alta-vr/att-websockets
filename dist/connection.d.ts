/// <reference types="ws" />
import WebSocket from 'isomorphic-ws';
export declare enum EventType {
    None = "None",
    TraceLog = "TraceLog",
    DebugLog = "DebugLog",
    InfoLog = "InfoLog",
    WarnLog = "WarnLog",
    ErrorLog = "ErrorLog",
    FatalLog = "FatalLog",
    OffLog = "OffLog",
    PlayerJoined = "PlayerJoined",
    PlayerLeft = "PlayerLeft",
    PlayerKilled = "PlayerKilled",
    CreatureKilled = "CreatureKilled",
    TradeDeckUsed = "TradeDeckUsed",
    PlayerMovedChunk = "PlayerMovedChunk",
    CreatureSpawned = "CreatureSpawned",
    TradeDeckModified = "TradeDeckModified",
    ToolHeadCreated = "ToolHeadCreated",
    ToolHeadForged = "ToolHeadForged",
    ChiselDeckSuccess = "ChiselDeckSuccess",
    ChiselDeckFailure = "ChiselDeckFailure",
    ChunkLoaded = "ChunkLoaded",
    ChunkUnloaded = "ChunkUnloaded"
}
export declare enum MessageType {
    SystemMessage = "SystemMessage",
    Subscription = "Subscription",
    CommandResult = "CommandResult"
}
export declare type Message = {
    id: number;
    type: MessageType;
    timeStamp: string;
    eventType?: EventType;
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
    connect(ipAddress: string, port: string | number): Promise<void>;
    handleMessage(message: any): void;
    getNextId(): number;
    send(content: string): number;
    terminate(): void;
}
