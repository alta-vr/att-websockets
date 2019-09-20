import { EventEmitter } from "events";
import Connection, { EventType, Message, MessageType } from "./connection";

export default class BasicWrapper
{
    emitter:EventEmitter = new EventEmitter();

    internal:Connection;

    onSystemMessage:(message:Message)=>void = console.log;

    constructor(remoteConsole:Connection)
    {
        this.internal = remoteConsole;

        remoteConsole.onMessage = this.handleMessage;
    }

    handleMessage(data:Message)
    {
        switch (data.type)
        {
            case MessageType.SystemMessage:
                this.onSystemMessage(data);
            break;

            case MessageType.Subscription:
                this.emitter.emit('SUB' + data.eventType, data.data);
            break;

            case MessageType.CommandResult:
                this.emitter.emit('CR' + data.commandId, data.data);
            break;
        }
    }

    send(command:string) : Promise<Message>
    {
        return new Promise((resolve, reject) => 
        {
            var id = this.internal.send(command);

            this.emitter.once('CR' + id, resolve);
        });
    }

    subscribe(event:EventType, callback:(result:any)=>void) : Promise<Message>
    {
        this.emitter.addListener('SUB' + event, callback);

        return this.send('websocket subscribe ' + event);
    }

    unsubscribe(event:EventType, callback:(result:any)=>void) : Promise<Message>
    {
        this.emitter.removeListener('SUB' + event, callback);
        
        return this.send('websocket unsubscribe ' + event);
    }
}