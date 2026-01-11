import { kafka_instance } from "./utils/index.js";
import type { Producer } from "kafkajs";
import { v4 as uuidv4 } from "uuid";
// const metrics = new PrometheusService();

class tread_executer_engine {
  private kafka_instance_for_current_trade_data: kafka_instance | undefined;
  private kafka_instance_for_user_tread: kafka_instance | undefined;
  private producer: Producer | undefined;
  private current_tread_price: any = {};

  constructor() {
    this.kafka_instance_for_current_trade_data = new kafka_instance(
      process.env.KAFKA_CLIENT_ID!,
      process.env.KAFKA_BROKER!
    );
    this.kafka_instance_for_user_tread = new kafka_instance(
      process.env.KAFKA_CLIENT_ID!,
      process.env.KAFKA_BROKER!
    );

    this.kafka_producer();
    setInterval(() => {
      // metrics.pushMetrics("tread_executer_engine");
    }, 5000);
  }

  private async kafka_producer() {
    this.producer = await this.kafka_instance_for_user_tread!.kafka_producer();
    await this.producer.connect();
  }
  private set_current_price(symbol: string, price: number) {
    try {
      if (this.current_tread_price[symbol]) {
        this.current_tread_price[symbol].price = price;
        this.current_tread_price[symbol].timestamp = Date.now();
        return true;
      } else {
        this.current_tread_price[symbol] = {
          price: price,
          timestamp: Date.now(),
        };
        return true;
      }
    } catch (error) {
      return false;
    }
  }

  // get curent price fro buy perpose
  private get_price_data_for_symbol(symbol: string, quantity: number) {
    if (!this.current_tread_price[symbol]) {
      throw new Error(`Symbol ${symbol} not found`);
    }
    const price = quantity * this.current_tread_price[symbol].price;

    return { price: price, status: true };
  }

  // get market come from poller
  public async get_current_market_price(group_id: string, topic: string) {
    const consumer =
      await this.kafka_instance_for_current_trade_data!.kafka_consumer(
        group_id,
        topic
      );
    consumer.run({
      eachMessage: async ({ topic, partition, message }: any) => {
        /////////////////// monitoring//////////////////
        // metrics.kafka_messages_consumed.inc({ topic });
        const startTime = performance.now();
        /////////////////// ////////////////// ////////
        const data = JSON.parse(message.value!.toString());
        if (!data.data) return;
        this.set_current_price(data.data.s, data.data.c);
        /////////////////// monitoring//////////////////
        const duration = (performance.now() - startTime) / 1000;
        // metrics.trade_processing_duration.observe({ topic }, duration);
        ////////////////////////////////////////////////////

        consumer.commitOffsets([
          {
            topic,
            partition,
            offset: (Number(message.offset) + 1).toString(),
          },
        ]);
      },
    });
  }

  // get user tread comming from primary backend
  public async get_user_tread(group_id: string, topic: string) {
    const consume = await this.kafka_instance_for_user_tread!.kafka_consumer(
      group_id,
      topic
    );
    consume.run({
      eachMessage: async ({ topic, partition, message }) => {
        /////////////////// monitoring//////////////////

        // metrics.kafka_messages_consumed.inc({ topic });

        ////////////////////////////////////////////////
        const data = JSON.parse(message.value!.toString());
        if (!data) return;

        if (data.type === "trade") {
          const {
            user_unique_id,
            symbol,
            quantity,
            type,
            take_profit,
            stop_loss,
          } = data.data;
          const { price, status } = this.get_price_data_for_symbol(
            symbol,
            quantity
          );
          const uniqueId = uuidv4();
          await this.send_message_from_matching_engine_and_storage(
            price,
            symbol,
            uniqueId,
            user_unique_id,
            type,
            take_profit,
            stop_loss,
            quantity
          );
        }

        consume.commitOffsets([
          {
            topic,
            partition,
            offset: (Number(message.offset) + 1).toString(),
          },
        ]);
      },
    });
  }

  // Sends trade status update to Kafka for a given user
  private async send_message_from_matching_engine_and_storage(
    current_price: number,
    symbol: string,
    id: string,
    user_unique_id: string,
    type: string,
    take_profit: number,
    stop_loss: number,
    quantity: string
  ) {
    /////////////////// monitoring//////////////////
    // metrics.kafka_messages_produced.inc({topic:process.env.KAFKA_USER_TREAD_TOPIC!});
    /////////////////////////////////////////

    await this.producer?.send({
      topic: process.env.KAFKA_USER_TREAD_TOPIC!,
      messages: [
        {
          value: JSON.stringify({
            type: "new_trade",
            data: {
              id: id,
              user_unique_id: user_unique_id,
              symbol: symbol,
              quantity: quantity,
              price: current_price,
              type: type,
              take_profit: take_profit,
              stop_loss: stop_loss,
            },
          }),
        },
      ],
    });

    await this.producer?.send({
      topic: process.env.STORE!,
      messages: [
        {
          value: JSON.stringify({
            type: "store_trade",
            data: {
              id: id,
              user_unique_id: user_unique_id,
              symbol: symbol,
              quantity: quantity,
              price: current_price,
              type: type,
              take_profit: take_profit,
              stop_loss: stop_loss,
            },
          }),
        },
      ],
    });
  }
}

const get_market_data = new tread_executer_engine();
get_market_data.get_current_market_price(
  process.env.MARKET_KAFKA_GROUP_ID!,
  process.env.MARKET_KAFKA_TOPIC!
);
get_market_data.get_user_tread(
  process.env.USER_KAFKA_GROUP_ID!,
  process.env.USER_KAFKA_TOPIC!
);
