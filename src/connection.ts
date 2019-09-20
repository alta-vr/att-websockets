import { Sessions } from 'alta-jsapi';

import WebSocket from 'isomorphic-ws';

export enum EventType
{
  None = 'None',

  //Implemented
  TraceLog = 'TraceLog',
  DebugLog = 'DebugLog',
  InfoLog = 'InfoLog',
  WarnLog = 'WarnLog',
  ErrorLog = 'ErrorLog',
  FatalLog = 'FatalLog',
  OffLog = 'OffLog',

  PlayerJoined = 'PlayerJoined',
  PlayerLeft = 'PlayerLeft',
  PlayerKilled = 'PlayerKilled',
  CreatureKilled = 'CreatureKilled',
  TradeDeckUsed = 'TradeDeckUsed',
  PlayerMovedChunk = 'PlayerMovedChunk',
  CreatureSpawned = 'CreatureSpawned',

  //Not Implemented
  TradeDeckModified = 'TradeDeckModified',
  ToolHeadCreated = 'ToolHeadCreated',
  ToolHeadForged = 'ToolHeadForged',
  ChiselDeckSuccess = 'ChiselDeckSuccess',
  ChiselDeckFailure = 'ChiselDeckFailure',
  ChunkLoaded = 'ChunkLoaded',
  ChunkUnloaded = 'ChunkUnloaded',
}

export enum MessageType
{
  SystemMessage = "SystemMessage",
  Subscription = "Subscription",
  CommandResult = "CommandResult"
}

export type Message =
{
  id:number,
  type: MessageType,
  timeStamp: string,
  eventType?: EventType,
  data: any,
  commandId?: number
}

export default class Connection
{
  name:string;

  connection:WebSocket|undefined;

  onMessage:(response:Message)=>void = console.log;

  onError = console.error;

  onClose = console.error;

  nextId = 0;

  constructor(name:string)
  {
    this.name = name;
  }

  async connect(ipAddress:string, port:string|number)
  {
    const connection = new WebSocket(`ws://${ipAddress}:${port}`);
    this.connection = connection;

    await new Promise((resolve, reject) => 
    {
      connection.onopen = () => 
      {
        connection.onmessage = (message:any) => 
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

        var token = Sessions.getLocalTokens().identity_token;

        if (!!token)
        {
          connection.send(token);
        }
        else
        {
          reject('No local token found. Are you logged in?');
        }
      };
      
      connection.onerror = reject;
    });

    connection.onmessage = this.handleMessage.bind(this);
    connection.onerror = (error:any) => this.onError(error);
    connection.onclose = (data:any) => this.onClose(data);
  }

  handleMessage(message:any)
  {
    var data:Message = JSON.parse(message.data);

    this.onMessage(data);
  }

  getNextId() : number
  {
    this.nextId++;
    return this.nextId;
  }

  send(content:string) : number
  {    
    if (!this.connection)
    {
      console.error("Connection not started. Call 'connect' first!");
      return -1;
    }

    var id = this.getNextId();

    this.connection.send(JSON.stringify({id, content}));

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
