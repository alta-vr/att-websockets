import { EventEmitter } from "events";
import Connection, { EventType, Message, MessageType } from "./connection";

export default class BasicWrapper extends EventEmitter
{
    internal:Connection;

    onSystemMessage:(message:Message)=>void = console.log;

    constructor(remoteConsole:Connection)
    {
        super();

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
                this.emit('SUB' + data.eventType, data.data);
            break;

            case MessageType.CommandResult:
                this.emit('CR' + data.commandId, data.data);
            break;
        }
    }

    send(command:string) : Promise<Message>
    {
        return new Promise((resolve, reject) => 
        {
            var id = this.internal.send(command);

            this.once('CR' + id, resolve);
        });
    }

    subscribe(event:EventType, callback:(result:any)=>void) : Promise<Message>
    {
        this.addListener('SUB' + event, callback);

        return this.send('websocket subscribe ' + event);
    }

    unsubscribe(event:EventType, callback:(result:any)=>void) : Promise<Message>
    {
        this.removeListener('SUB' + event, callback);
        
        return this.send('websocket unsubscribe ' + event);
    }
}