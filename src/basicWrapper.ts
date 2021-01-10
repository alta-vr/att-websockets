import { EventEmitter } from "events";
import Connection, { Message, MessageType } from "./connection";

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

            default:
                console.log("Unhandled message:");
                console.log(data);
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

    async subscribe(event:string, callback:(result:any)=>void) : Promise<any>
    {
        console.log("Subscribing to " + event);

        this.emitter.addListener('SUB' + event, callback);

        var result = await this.send('websocket subscribe ' + event);

        if (!!result.Exception)
        {
            console.error(`Failed to subscribe to ${event}`);
            console.error(result.Exception);
        }
        else
        {
            console.log(`Subscribed to ${event} : ${result.ResultString}`);
        }

        return result;
    }

    async unsubscribe(event:string, callback:(result:any)=>void) : Promise<any>
    {
        console.log("Unsubscribing from " + event);

        this.emitter.removeListener('SUB' + event, callback);
        
        var result = await this.send('websocket unsubscribe ' + event);

        if (!!result.Exception)
        {
            console.error(`Failed to unsubscribe from ${event}`);
            console.error(result.Exception);
        }
        else
        {
            console.log(`Unsubscribed from ${event} : ${result.ResultString}`);
        }

        return result;
    }
}