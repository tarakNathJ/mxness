import WebSocket, { WebSocketServer } from "ws";
import express from "express";
import { Kafka, type Consumer } from "kafkajs";
import {config} from "dotenv";

config()

interface client {
  socket: WebSocket;
  id: number;
}

class web_socket_server {
  private clients: Map<number, client> = new Map();
  private app = express();
  private WSS;
  private count: number = 0;
  private consumer: Consumer | undefined;

  constructor(port: number) {
    const server = this.app.listen(port, () => {
      console.log(`server start at ${port}`);
    });
    this.WSS = new WebSocketServer({ server: server });
  }

  //   init kafka
  private async init_kafka(group_id: string) {
    if (this.consumer) return this.consumer;

    const kafka_init = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID!,
      brokers: [process.env.KAFKA_BROKER!],
    });
    this.consumer  =  kafka_init.consumer({groupId:group_id})
    await this.consumer.connect()
    await this.consumer.subscribe({topic:process.env.KAFKA_TOPIC ! ,fromBeginning: true})

    return this.consumer;
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
            console.log("user join", this.count);
            break;
          case "message":
            this.clients.forEach((client) => {
              console.log(message);
              client.socket.send(JSON.stringify(message));
            });
            break;
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
