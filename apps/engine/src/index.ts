import { ring_buffer } from "./utils/ring_buffer.js";
import { order_book } from "./utils/b-tree.js";
import { kafka_instance } from "./utils/kafka_instance_provider.js";
import type { Producer } from "kafkajs";

class tread_executer_engine {
  private ring_buffer: ring_buffer = new ring_buffer(32);
  private order_book: order_book = new order_book();
  private kafka_instance_for_current_trade_data: kafka_instance | undefined;
  private kafka_instance_for_user_tread: kafka_instance | undefined;
  private producer: Producer | undefined;

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
  }

  private async kafka_producer() {
    this.producer = await this.kafka_instance_for_user_tread!.kafka_producer();
    await this.producer.connect();
  }

  public async get_current_market_price(group_id: string, topic: string) {
    const consumer =
      await this.kafka_instance_for_current_trade_data!.kafka_consumer(
        group_id,
        topic
      );
    consumer.run({

      eachMessage: async ({ topic, partition, message }: any) => {


        const data = JSON.parse(message.value!.toString());
        if (!data.data) return;


        const tread_data = {
          symbol: data.data.s,
          price: parseFloat(data.data.c),
        };


        this.ring_buffer.ring_publish(tread_data);

        
        const event = this.ring_buffer.ring_consumer();
        if (!event) return;

        // calculate takeProfit stoploss
        for (let [price, orders] of this.order_book.buy.entries()) {
          for (const order of orders) {
            if (event.symbol === order.symbol) {
              await this.calculate_take_profit_stop_loss_for_buyers(
                event.price,
                order.take_profit,
                order.stop_loss,
                price,
                order.qty,
                order.symbol,
                order.user
              );
            }
          }
        }

        for (let [price, orders] of this.order_book.sell.entries()) {
          for (const order of orders) {
            if (event.symbol === order.symbol) {
              await this.calculate_take_profit_stop_loss_for_seller(
                event.price,
                order.take_profit,
                order.stop_loss,
                price,
                order.qty,
                order.symbol,
                order.user
              );
            }
          }
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
  }

  public async get_user_tread(group_id: string, topic: string) {
    const consume = await this.kafka_instance_for_user_tread!.kafka_consumer(
      group_id,
      topic
    );
    consume.run({
      eachMessage: async ({ topic, partition, message }) => {
        const data = JSON.parse(message.value!.toString());
        if (!data) return;

        if (data.type === "new_trade") {
          this.order_book.add_order(data.data.type, data.data.price, {
            user: data.data.user_unique_id,
            qty: data.data.quantity,
            take_profit: data.data.take_profit,
            stop_loss: data.data.stop_loss,
            symbol: data.data.symbol,
            id:data.data.id
          });
        }else if(data.type === "cancel_trade"){
          const id = data.data.id;
          const type = data.data.type;
          const  qty = data.data.quantity
          if(!id) return
          this.order_book.cancel_trade(id,type ,qty);
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

  private async calculate_take_profit_stop_loss_for_buyers(
    current_stock_price: number,
    tp: number,
    sl: number,
    price: number,
    quentity: number,
    symbol: string,
    user_id: string
  ) {
    if (current_stock_price * quentity >= tp) {

      console.log(user_id , "  delete user");
      this.order_book.delete_order(user_id,"long")

      this.send_message_from_user(
        current_stock_price * quentity,
        symbol,
        user_id,
        "take profit hit"
      );
    } else if (
      current_stock_price * quentity < tp &&
      current_stock_price * quentity > sl
    ) {
      this.send_message_from_user(
        current_stock_price * quentity,
        symbol,
        user_id,
        "trade hold"
      );
    } else if (current_stock_price * quentity <= sl) {
      this.order_book.delete_order(user_id,"long")
      this.send_message_from_user(
        current_stock_price * quentity,
        symbol,
        user_id,
        "stop loss hit"
      );
    }
  }
  private async calculate_take_profit_stop_loss_for_seller(
    current_stock_price: number,
    tp: number,
    sl: number,
    price: number,
    quentity: number,
    symbol: string,
    user_id: string
  ) {
    if (current_stock_price * quentity <= tp) {

      this.order_book.delete_order(user_id,"short")
      this.send_message_from_user(
        current_stock_price * quentity,
        symbol,
        user_id,
        "take profit hit"
      );
    } else if (
      current_stock_price * quentity > tp &&
      current_stock_price * quentity < sl
    ) {
      this.send_message_from_user(
        current_stock_price * quentity,
        symbol,
        user_id,
        "trade hold"
      );
    } else if (current_stock_price * quentity >= sl) {

      this.order_book.delete_order(user_id,"short")
      this.send_message_from_user(
        current_stock_price * quentity,
        symbol,
        user_id,
        "stop loss hit"
      );
    }
  }

  private send_message_from_user(
    current_price: number,
    symbol: string,
    user_id: string,
    message:string
  ) {

    
    this.producer?.send({
      topic: process.env.KAFKA_USER_TREAD_TOPIC!,
      messages: [
        {
          value: JSON.stringify({
            type: "tread_status",
            data: {
              current_price,
              symbol,
              user_id,
              message
            },
          }),
        },
      ],
    });
  }
}


const get_market_data =  new tread_executer_engine();
get_market_data.get_current_market_price(process.env.MARKET_KAFKA_GROUP_ID!, process.env.MARKET_KAFKA_TOPIC!);
get_market_data.get_user_tread(process.env.USER_KAFKA_GROUP_ID!, process.env.USER_KAFKA_TOPIC!);



/*

/opt/kafka/bin/kafka-topics.sh --create \
  --topic TRADE \
  --bootstrap-server localhost:9092 \
  --partitions 1 \
  --replication-factor 1

/opt/kafka/bin/kafka-topics.sh --create \
  --topic MARKET-DATA \
  --bootstrap-server localhost:9092 \
  --partitions 1 \
  --replication-factor 1

/opt/kafka/bin/kafka-topics.sh --create \
  --topic USER-TRADE \
  --bootstrap-server localhost:9092 \
  --partitions 1 \
  --replication-factor 1




*/