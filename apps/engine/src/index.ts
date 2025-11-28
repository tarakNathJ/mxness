import { ring_buffer } from "./utils/ring_buffer.js";
import { order_book } from "./utils/b-tree.js";
import { kafka_instance } from "./utils/kafka_instance_provider.js";

class tread_executer_engine {
  private ring_buffer: ring_buffer = new ring_buffer(32);
  private order_book: order_book = new order_book();
  private kafka_instance_for_current_trade_data: kafka_instance | undefined;
  private kafka_instance_for_user_tread: kafka_instance | undefined;
  private current_trade_market_price_with_symbol: any = {};
  constructor() {
    this.kafka_instance_for_current_trade_data = new kafka_instance(
      process.env.KAFKA_CLIENT_ID!,
      process.env.KAFKA_BROKER!
    );
    this.kafka_instance_for_user_tread = new kafka_instance(
      process.env.KAFKA_CLIENT_ID!,
      process.env.KAFKA_BROKER!
    );
  }

  // store updated  price
  private async store_current_trade_data(symbol: string, price: number) {
    if (this.current_trade_market_price_with_symbol[symbol]) {
      this.current_trade_market_price_with_symbol[symbol].price = price;
    } else {
      this.current_trade_market_price_with_symbol[symbol] = { rice: price };
    }
  }

  // get curent market price
  async get_current_market_price(group_id: string, topic: string) {
    const consumer =
      await this.kafka_instance_for_current_trade_data!.kafka_consumer(
        group_id,
        topic
      );
    consumer.run({
      eachMessage: async ({ topic, partition, message }: any) => {
        const data = JSON.parse(message.value!.toString());
        if (!data.data) return;

        // set current trade price
        this.store_current_trade_data(data.data.s, parseFloat(data.data.c));

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

  async get_user_tread(group_id: string, topic: string) {
    const consume = await this.kafka_instance_for_user_tread!.kafka_consumer(
      group_id,
      topic
    );
    consume.run({
      eachMessage: async ({ topic, partition, message }) => {
        const data = JSON.parse(message.value!.toString());
        if (!data) return;
        if(data.type === "create_new_tread"){
            
        }

      },
    });
  }
}

// const ring = new ring_buffer(32);
// const book = new order_book();

// for (let u = 1; u <= 10; u++) {
//   const randomPrice = 100 + Math.floor(Math.random() * 20);

//   book.add_order("buy", randomPrice, {
//     user: u,
//     qty: 1,
//     takeProfit: randomPrice + 5,
//     stopLoss: randomPrice - 5,
//   });
// }

// setInterval(() => {
//   const tick = {
//     price: 100 + Math.floor(Math.random() * 20),
//     time: Date.now(),
//   };
//   ring.ring_publish(tick);
// }, 1000);

// setInterval(() => {
//   const event = ring.ring_consumer();
//   if (!event) return;
//   console.log(" curent stock price:  ", event);

//   for (let [price, orders] of book.buy.entries()) {
//     console.log("price ",price);
//     for (const order of orders) {
//       console.log( "user data order :",order);
//     }
//   }
// });
