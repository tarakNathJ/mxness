import { Kafka, type Consumer, type Producer } from "kafkajs";
import { config } from "dotenv";
import { set_curent_price } from "../controller/auth.controller.js";
import { WebSocketServer, type WebSocket } from "ws";
import { db, eq, user, user_unique_id } from "@database/main/dist/index.js";

import { metrics } from "../app.js";
// import { curent_price } from "../controller/auth.controller.js";
config();

interface user {
  id: string;
  ws: WebSocket;
}
const create_tread_topic = process.env.CREATE_TREAD_TOPIC;
if (!create_tread_topic) {
  throw new Error("create_tread_topic env not exist");
}

class kafka_instance {
  private kafka: Kafka | undefined;
  private producer: Producer | undefined;
  private consumer: Consumer | undefined;
  private consumer2: Consumer | undefined;
  private kafka_topic: string | undefined;

  private kafka_group_id: string | undefined;
  private users: user[] = [];

  // socket server
  private WSS: WebSocketServer | undefined;

  constructor(KAFKA_GROUP_ID: string, KAFKA_TOPIC: string) {
    this.kafka_group_id = KAFKA_GROUP_ID;
    this.kafka_topic = KAFKA_TOPIC;

    this.kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID!,
      brokers: [process.env.KAFKA_BROKER!],
    });
  }

  // kafka consumer consume binance data and  send all data
  public async init_consumer() {
    try {
      const get_consumer = await this.init_kafka_consumer(
        this.kafka_group_id!,
        this.kafka_topic!
      );
      get_consumer?.run({
        eachMessage: async ({ topic, partition, message }) => {
          /////////////////////////metrics/////////////////////////
          metrics.kafka_messages_consumed.inc({ topic: this.kafka_topic! });

          ////////////////////////////////////////////////////////
          const data = JSON.parse(message.value!.toString());

          if (!data) return;

          ////////////////////////////update price //////////////////
          set_curent_price(data.data.s, parseFloat(data.data.c));
          ///////////////////////////////end/////////////////////////
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

  //   init kafka consumer
  private async init_kafka_consumer(
    group_id: string,
    topic: string = this.kafka_topic!
  ) {
    try {
      if (this.consumer) return this.consumer;

      this.consumer = this.kafka?.consumer({ groupId: group_id });
      await this.consumer?.connect();
      await this.consumer?.subscribe({
        topic: topic,
        fromBeginning: true,
      });

      return this.consumer;
    } catch (error: any) {
      throw error.message;
    }
  }

  // this is kafka producer
  public async get_producer(): Promise<Producer> {
    if (this.producer) return this.producer;
    this.producer = this.kafka?.producer() as Producer;
    await this.producer?.connect();

    return this.producer;
  }

  private async kafka_second_consumer_for_user_tread(
    group_id: string,
    topic: string = this.kafka_topic!
  ) {
    try {
      if (this.consumer2) return this.consumer2;

      this.consumer2 = this.kafka?.consumer({ groupId: group_id });
      await this.consumer2?.connect();
      await this.consumer2?.subscribe({
        topic: topic,
        fromBeginning: true,
      });

      return this.consumer2;
    } catch (error: any) {
      throw error.message;
    }
  }

  public async get_user_trade_data(group_id: string, topic: string) {
    try {
      const consumer = await this.kafka_second_consumer_for_user_tread(
        group_id,
        topic
      );
      consumer?.run({
        eachMessage: async ({ topic, partition, message }) => {
          /////////////////////////metrics////////////////
          metrics.kafka_messages_consumed.inc({ topic: topic });
          ////////////////////////////////////////
          let data: any;
          const start = performance.now();
          try {
            data = JSON.parse(message.value!.toString()) || {};
          } catch (error: any) {
            console.log("samthing want wrong", error.message);
            return;
          }
          try {
            if (!data.data) return;
            const user_data = this.users.find(
              (us) => us.id === data.data.user_id
            );

            user_data?.ws.send(JSON.stringify(data));
            ////////////////////////////metrics////////////////
            metrics.trade_processing_duration.observe(
              { topic: "ws_send" },
              (performance.now() - start) / 1000
            );
            ///////////////////////////////////////////////
          } catch (error: any) {
            return;
          }
          consumer.commitOffsets([
            {
              topic,
              partition,
              offset: (Number(message.offset) + 1).toString(),
            },
          ]);
        },
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // socket server

  public start_ws_server_and_serve(server_instance: any) {
    this.WSS = new WebSocketServer({ server: server_instance });

    this.WSS.on("connection", (ws) => {
      /////////////////////////metrics///////////////
      metrics.ws_connections.inc();
      metrics.ws_active_connections.inc();
      ////////////////////////////metrics/////////////////////
      ws.on("message", async (message) => {
        let data;
        try {
          data = JSON.parse(message.toString());
        } catch {
          ws.send("invalid message formet");
        }

        try {
          switch (data.type) {
            case "join":
              if (!data.payload.email) return;

              const [result] = await db
                .select({ u_id: user_unique_id.unique_id })
                .from(user_unique_id)
                .innerJoin(user, eq(user_unique_id.user_id, user.id))
                .where(eq(user.email, data.payload.email));
              if (!result || !result.u_id) {
                ws.send("user not present");
              }

              this.users.push({
                //@ts-ignore
                id: result?.u_id,
                ws: ws,
              });

              ws.send(
                JSON.stringify({
                  type: "join_success",
                  message: "Joined successfully",
                })
              );
              break;

            case "Trade":
              if (!data.payload) return;
              const { symbol, quantity, type, take_profit, stop_loss, uId } =
                data.payload;
              if (
                !symbol ||
                !quantity ||
                !type ||
                !take_profit ||
                !stop_loss ||
                !uId
              ) {
                ws.send(
                  JSON.stringify({
                    type: "trade_mismatch",
                  })
                );
              }
              if (!create_tread_topic) {
                throw new Error("create_tread_topic env not exist");
              }

              const producer = await this.get_producer();
              producer.send({
                topic: create_tread_topic,
                messages: [
                  {
                    value: JSON.stringify({
                      type: "trade",
                      data: {
                        user_unique_id: uId,
                        symbol: symbol,
                        quantity: quantity,
                        type: type,
                        take_profit: take_profit,
                        stop_loss: stop_loss,
                      },
                    }),
                  },
                ],
              });

            default:
              break;
          }
        } catch (error: any) {
          ws.send("samthong want wrong ");
        }
      });

      ws.on("close", () => {
        this.users = this.users.filter((user) => user.ws !== ws);
      });
    });
  }
}

export { kafka_instance };
