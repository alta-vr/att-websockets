import { EventEmitter } from "events";
import Connection, { EventType, Message, MessageType } from "./connection";

export default class BasicWrapper
{
    emitter:EventEmitter;

    internal:Connection;

    onSystemMessage:(message:Message)=>void = console.log;

    constructor(remoteConsole:Connection)
    {
        this.internal = remoteConsole;

        this.emitter = new EventEmitter();

        remoteConsole.onMessage = this.handleMessage.bind(this);
    }

    handleMessage(data:Message)
    {
        console.log(data);

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

    send(command:string) : Promise<any>
    {
        return new Promise((resolve, reject) => 
        {
            var id = this.internal.send(command);

            this.emitter.once('CR' + id, resolve);
        });
    }

    async subscribe(event:EventType, callback:(result:any)=>void) : Promise<any>
    {
        console.log("Subscribing to " + event);

        this.emitter.addListener('SUB' + event, callback);

        var result = await this.send('websocket subscribe ' + event);

        console.log("Subscription to " + event + " result:");
        console.log(result);

        return result;
    }

    async  unsubscribe(event:EventType, callback:(result:any)=>void) : Promise<any>
    {
        console.log("Unsubscribing from " + event);

        this.emitter.removeListener('SUB' + event, callback);
        
        var result = await this.send('websocket unsubscribe ' + event);

        console.log("Unsubscribing from " + event + " result:");
        console.log(result);

        return result;
    }
}