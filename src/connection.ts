import WebSocket from 'isomorphic-ws';

import jwt from 'jsonwebtoken';

import nodeFetch from 'node-fetch';

try
{
    var fetch = nodeFetch.bind(window);
}
catch
{
    var fetch = nodeFetch;
}

export enum MessageType
{
    SystemMessage = "SystemMessage",
    Subscription = "Subscription",
    CommandResult = "CommandResult"
}

export type Message =
{
    id: number,
    type: MessageType,
    timeStamp: string,
    eventType?: string,
    data: any,
    commandId?: number
}

class ConnectionError extends Error
{
    details:any;

    constructor(message:string, details:any)
    {
        super(message);

        this.details = details;
    }
}

export interface AccessProvider
{
    serverId: number;
    token: string;
    decoded:any;
    ipAddress: string;
    webserverPort: number;
    websocketPort: number;

    check() : Promise<void>;
}

interface ServersModule
{
    joinConsole(id:number, start:boolean):Promise<any>;
}

export class JsapiAccessProvider implements AccessProvider
{
    serverId: number;

    token: string = '';
    decoded: any = null;
    ipAddress: string = '127.0.0.1';
    webserverPort: number = 1760;
    websocketPort: number = 1761;

    serversModule:ServersModule;

    constructor(serverId:number, serversModule:ServersModule)
    {
        this.serverId = serverId;
        this.serversModule = serversModule;
    }
    
    async check()
    {
        if (!this.decoded || this.decoded.exp - new Date().getTime() / 1000 < 15)
        {
            var details = await this.serversModule.joinConsole(this.serverId, false);

            if (details.allowed)
            {
                this.ipAddress = details.connection.address || this.ipAddress;
                this.websocketPort = details.connection.websocket_port || this.websocketPort;
                this.webserverPort = details.connection.webserver_port || this.webserverPort;
                this.token = details.token;
                this.decoded = jwt.decode(this.token);
            }
            else
            {
                throw new ConnectionError("Connection rejected", details);
            }
        }
    }
}

export default class Connection
{
    serverId: number;
    name: string;

    access: AccessProvider;

    connection: WebSocket | undefined;

    onMessage: (response: Message) => void = console.log;

    onError = console.error;

    onClose = console.error;

    nextSendId = 0;
    nextReceiveId = 0;

    constructor(access: AccessProvider, name: string)
    {
        this.serverId = access.serverId;
        this.access = access;

        this.name = name;
    }

    async open()
    {
        await this.access.check();

        var { ipAddress, websocketPort, token } = this.access;

        console.log(`Connecting to ${ipAddress}:${websocketPort}`);

        const connection = new WebSocket(`ws://${ipAddress}:${websocketPort}`);
        this.connection = connection;

        await new Promise<void>((resolve, reject) => 
        {
            connection.onopen = () => 
            {
                connection.onmessage = (message: any) => 
                {
                    var data = JSON.parse(message.data);

                    if (data.type == 'FatalLog' || data.type == 'ErrorLog')
                    {
                        console.error("Failing connection!");
                        console.error(message);
                        reject(data.data);
                    }
                    else
                    {
                        console.log("Resolving connection!");
                        console.log(data.data);
                        resolve();
                    }
                }

                connection.send(token);
            };

            connection.onerror = reject;
        });

        connection.onmessage = this.handleMessage.bind(this);
        connection.onerror = (error: any) => this.onError(error);
        connection.onclose = (data: any) => this.onClose(data);
    }


    async download(downloadUrl:string)
    {
        await this.access.check();

        var { ipAddress, webserverPort, token, decoded } = this.access;

        return await fetch(`http://${ipAddress}:${webserverPort}/output/${decoded.UserId}/${downloadUrl}`, { headers: { "Authorization": `Bearer ${token}` } });
    }

    handleMessage(message: any)
    {
        var data: Message = JSON.parse(message.data);

        data.id = this.nextReceiveId++;

        if (data.type == MessageType.CommandResult && !!data.data.Result && !!data.data.Result.downloadUrl)
        {
            let file = data.data.Result.downloadUrl;

            data.data.download = () => this.download(file);
        }

        this.onMessage(data);
    }

    send(content: string): number
    {
        if (!this.connection)
        {
            console.error("Connection not started. Call 'connect' first!");
            return -1;
        }

        var id = this.nextSendId++;

        this.connection.send(JSON.stringify({ id, content }));

        return id;
    }

    terminate() 
    {
        try 
        {
            if (!!this.connection)
            {
                this.connection.close();
            }
        }
        catch (error) 
        {
            console.log(`Error destroying connection : ${error}`);
        }
    }
}
