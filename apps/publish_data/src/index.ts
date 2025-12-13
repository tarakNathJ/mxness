import WebSocket, { WebSocketServer } from "ws";
import express from "express";
import { Kafka, type Consumer } from "kafkajs";
import { config } from "dotenv";
import { PrometheusService } from "@express/monitoring";

config();

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
  private curent_price: any = {};
  private metrics = new PrometheusService();

  // init websocket server
  constructor(port: number) {
    const server = this.app.listen(port, () => {
      console.log(`server start at ${port}`);
    });
    this.WSS = new WebSocketServer({ server: server });
    this.init_consumer();

    setInterval(async () => {
      await this.metrics.pushMetrics("ws_kafka_publisher");
    }, 5000);
  }

  private setprice(symbol: string, price: number) {
    try {
      if (this.curent_price[symbol]) {
        this.curent_price[symbol].price = price;
        this.curent_price[symbol].timestamp = Date.now();
        return true;
      } else {
        this.curent_price[symbol] = {
          price: price,
          timestamp: Date.now(),
        };
        return true;
      }
    } catch (error) {
      return false;
    }
  }

  // kafka consumer consume binance data and  send all data
  private async init_consumer() {
    try {
      const get_consumer = await this.init_kafka(process.env.KAFKA_GROUP_ID!);
      get_consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          const start = performance.now();
          const data = JSON.parse(message.value!.toString());
          if (!data) return;

          // Update metrics
          this.metrics.kafka_messages_consumed.inc({ topic });
          // store cursent price

          this.setprice(data.data.s, parseFloat(data.data.c));

          // send data all connected client
          this.clients.forEach((client) => {
            client.socket.send(JSON.stringify(data));
          });

          // Track processing duration
          this.metrics.trade_processing_duration.observe(
            { topic },
            (performance.now() - start) / 1000
          );

          get_consumer.commitOffsets([
            {
              topic,
              partition,
              offset: (Number(message.offset) + 1).toString(),
            },
          ]);
        },
      });
    } catch (error: any) {
      
      throw Error(error.message);
    }
  }

  //   init kafka
  private async init_kafka(group_id: string) {
    try {
      if (this.consumer) return this.consumer;

      const kafka_init = new Kafka({
        clientId: process.env.KAFKA_CLIENT_ID!,
        brokers: [process.env.KAFKA_BROKER!],
      });
      this.consumer = kafka_init.consumer({ groupId: group_id });
      await this.consumer.connect();
      await this.consumer.subscribe({
        topic: process.env.KAFKA_TOPIC!,
        fromBeginning: true,
      });

      return this.consumer;
    } catch (error: any) {
    
      throw error.message;
    }
  }

  // ws connection
  public start() {
    this.WSS.on("connection", (ws) => {
      this.count = this.count + 1;
      this.metrics.ws_connections.inc();
      this.metrics.ws_active_connections.inc();
      ws.on("message", (data) => {
        // chack message are exist or  not
        let message;
        try {
          message = JSON.parse(data.toString());
        } catch (error) {
         
          ws.send(
            JSON.stringify({
              type: "error",
              error: "Invalid message format",
            })
          );
        }

        // chack message type
        if (!message.type) {
          ws.send(
            JSON.stringify({
              type: "error",
              error: "Invalid message format: type property missing",
            })
          );
          return;
        }

        try {
          switch (message.type) {
            case "join":
              this.clients.set(this.count, {
                id: this.count,
                socket: ws,
              });
              ws.send(
                JSON.stringify({
                  type: "join_successfully",
                  payload: {
                    data: this.curent_price,
                    success: true,
                    message: "join success fully",
                  },
                })
              );
              break;

            default:
              break;
          }
        } catch (error) {
          
          ws.send(
            JSON.stringify({
              type: "error",
              error: "Internal server error",
            })
          );
        }
      });
      ws.on("close", () => {
        // Remove client when disconnected
        this.clients.forEach((client, id) => {
          if (client.socket === ws) {
            this.clients.delete(id);
            
          }
        });
         this.metrics.ws_active_connections.dec();
      });
      ws.on("error", () => {});
    });
  }
}

const port = process.env.PORT;
if (!port) throw new Error("port not found");
new web_socket_server(parseInt(port)).start();
