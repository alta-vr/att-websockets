import { Sessions } from 'alta-jsapi';

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

  //Not Implemented
  PlayerKilled = 'PlayerKilled',
  CreatureKilled = 'CreatureKilled',
  TradeDeckModified = 'TradeDeckModified',
  TradeDeckUsed = 'TradeDeckUsed',
  ToolHeadCreated = 'ToolHeadCreated',
  ToolHeadForged = 'ToolHeadForged',
  ChiselDeckSuccess = 'ChiselDeckSuccess',
  ChiselDeckFailure = 'ChiselDeckFailure',
  ChunkLoaded = 'ChunkLoaded',
  ChunkUnloaded = 'ChunkUnloaded',
  PlayerMovedChunk = 'PlayerMovedChunk',
  CreatureSpawned = 'CreatureSpawned'
}

export enum MessageType
{
  SystemMessage,
  Subscription,
  CommandResult
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

        connection.onmessage = message => 
        {
            var data = JSON.parse(message.data);

            if (data.type == 'FatalLog' || data.type == 'ErrorLog')
            {
                reject(data.message);
            }
            else
            {
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

    connection.onmessage = this.handleMessage;
    connection.onerror = error => this.onError(error);
    connection.onclose = data => this.onClose(data);
  }

  handleMessage(message:MessageEvent)
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
