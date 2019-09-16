import { EventEmitter } from "events";
import Connection, { RequestType, EventType, InfoType } from "./connection";

export default class BasicWrapper extends EventEmitter
{
    internal:Connection;

    constructor(remoteConsole:Connection)
    {
        super();

        this.internal = remoteConsole;

        remoteConsole.onMessage = this.handleMessage;
    }

    handleMessage(message:{data:string})
    {
        var data = JSON.parse(message.data);

        if (data.type == 'Susbcription')
        {
            this.emit('EVENT' + data.eventType, data.data);
        }
        else if (data.type == 'Info')
        {
            this.emit('INFO' + data.infoType, data.info);
        }
    }

    sendCommand(command:string)
    {
        this.internal.sendStructured(RequestType.Command, command);
    }

    async getInfo(info:InfoType)
    {
        return new Promise((resolve, reject) => 
        {
            this.once('INFO' + info, resolve);

            setTimeout(reject, 5000);
        });
    }

    subscribe(event:EventType, callback:(result:any)=>void)
    {
        this.addListener('EVENT' + event, callback);

        this.internal.sendStructured(RequestType.Subscribe, undefined, undefined, event);
    }

    unsubscribe(event:EventType, callback:(result:any)=>void)
    {
        this.removeListener('EVENT' + event, callback);
        
        this.internal.sendStructured(RequestType.Unsubscribe, undefined, undefined, event);
    }
}