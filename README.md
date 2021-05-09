# att-websockets
Websocket connections for ATT



# Create a connection
```let serverId = 123;
let connectionName = "Test";

let connection = new Connection(serverId, connectionName);

connection.onMessage = console.log;

try
{
    await connection.open();

    connection.send("player kill Joel");
}
catch (e)
{
    console.error("Error connecting to server");
    console.error(e);
}
```

# Use the basic wrapper
This is recommended for 90% of cases, as it handles subscriptions and command responses

```let wrapper = new BasicWrapper(connection);

var result = await wrapper.send("spawn joel dynamite");

wrapper.subscribe("PlayerJoined", console.log);
```
