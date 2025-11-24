import WebSocket, { WebSocketServer, type Server } from "ws";
import express from "express";

interface client {
  socket: WebSocket;
  id: number;
}

class web_socket_server {
  private clients: Map<number, client> = new Map();
  private app = express();
  private WSS;
  private count: number = 0;

  constructor(port: number) {
    const server = this.app.listen(port, () => {
      console.log(`server start at ${port}`);
    });
    this.WSS = new WebSocketServer({ server: server });
  }

  public start() {
    this.WSS.on("connection", (ws) => {
      this.count = this.count + 1;
      ws.on("message", (data) => {
        const message = JSON.parse(data.toString());
        switch (message.type) {
          case "join":
            this.clients.set(this.count, {
              id: this.count,
              socket: ws,
            });
            console.log("user join",this.count);
            break;
          case "message":
            this.clients.forEach((client)=>{
                console.log(message);
                client.socket.send(JSON.stringify(message))
            })
            break
          default:
            break;
        }
      });
      ws.on("close", () => {
        // Remove client when disconnected
        this.clients.forEach((client, id) => {
          if (client.socket === ws) {
            this.clients.delete(id);
            console.log(`Client disconnected ID=${id}`);
          }
        });
      });
    });
  }
}

new web_socket_server(4500).start();
