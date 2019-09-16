import { Sessions } from 'alta-jsapi';

export enum EventType
{
  None,

  //Implemented
  TraceLog,
  DebugLog,
  InfoLog,
  WarnLog,
  ErrorLog,
  FatalLog,
  OffLog,

  PlayerJoined,
  PlayerLeft,

  //Not Implemented
  PlayerKilled,
  CreatureKilled,
  TradeDeckModified,
  TradeDeckUsed,
  ToolHeadCreated,
  ToolHeadForged,
  ChiselDeckSuccess,
  ChiselDeckFailure,
  ChunkLoaded,
  ChunkUnloaded,
  PlayerMovedChunk,
  CreatureSpawned
}

export enum RequestType
{
  Info,
  Command,
  Subscribe,
  Unsubscribe
}

export enum InfoType
{
  Infos,
  Events,
  Modules,
  Players
}

interface Window {
  WebSocket: any;
  MozWebSocket: any;
}

export default class Connection
{
  name:string;

  connection:WebSocket|undefined;

  onMessage = console.log;

  onError = console.error;

  onClose = console.error;

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

    connection.onmessage = message => this.onMessage(message);
    connection.onerror = error => this.onError(error);
    connection.onclose = data => this.onClose(data);
  }

  sendStructured(type:RequestType, content:string|undefined, infoType:InfoType|undefined = undefined, eventType:EventType|undefined = undefined)
  {
      this.send(JSON.stringify({type, content, infoType, eventType}));
  }

  send(command:string) 
  {
    if (!this.connection)
    {
      console.error("Connection not started. Call 'connect' first!");
      return;
    }

    this.connection.send(command);
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
