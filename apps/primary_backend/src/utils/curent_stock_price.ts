import { Kafka, type Consumer, type Producer } from "kafkajs";
import { config } from "dotenv";
import { set_curent_price } from "../controller/auth.controller.js";
config();

class kafka_instance {
  private kafka: Kafka | undefined;
  private producer: Producer | undefined;
  private consumer: Consumer | undefined;
  private kafka_topic: string | undefined;
  private kafka_group_id: string | undefined;

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
      const get_consumer = await this.init_kafka_consumer(this.kafka_group_id!);
      get_consumer?.run({
        eachMessage: async ({ topic, partition, message }) => {
          const data = JSON.parse(message.value!.toString());
          if (!data) return;
          console.log(data);
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
      console.error("Error initializing consumer:", error.message);
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
      console.error("Error initializing Kafka:", error.message);
      throw error;
    }
  }

  // this is kafka producer
  public async get_producer(): Promise<Producer> {
    if (this.producer) return this.producer;
    this.producer = this.kafka?.producer() as Producer;
    await this.producer?.connect();

    return this.producer;
  }

  public async get_user_trade_data(group_id: string, topic: string) {
    try {
      const consumer = await this.init_kafka_consumer(group_id, topic);
      consumer?.run({
        eachMessage: async ({ topic, partition, message }) => {
          const data = JSON.parse(JSON.stringify(message.value));
          console.log(data);

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
}

export { kafka_instance };
