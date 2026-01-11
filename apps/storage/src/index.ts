import { Kafka, type Consumer } from "kafkajs";
// import { KafkaMessage } from "kafkajs";
import {
  db,
  tread_history,
  options_tread,
  user_unique_id,
  eq,
} from "@database/main/dist/index.js";

interface Tdata {
  id: string;
  user_unique_id: string;
  symbol: string;
  quantity: number;
  price: number;
  type: string;
  take_profit: number;
  stop_loss: number;
}

interface TtreadData {
  type: string;
  data: Tdata;
}

class KafkaClient {
  private kafka: Kafka;
  private consumer: Consumer | undefined;

  constructor() {
    this.kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID!,
      brokers: [process.env.KAFKA_BROKER!],
    });
  }

  private async init_consumer() {
    if (this.consumer) return this.consumer;
    const consumer = this.kafka.consumer({
      groupId: process.env.KAFKA_GROUP_ID!,
    });
    await consumer.connect();
    await consumer.subscribe({
      topic: process.env.KAFKA_TOPIC!,
      fromBeginning: true,
    });
    this.consumer = consumer;
    return consumer;
  }

  public async consume_tread_history() {
    const get_consumer = await this.init_consumer();
    await get_consumer.run({
      eachMessage: async ({ message, partition }) => {
        const data: TtreadData = JSON.parse(message.value!.toString());
        console.log(data);
        if (data.type == "store_trade") {
          const [userData] = await db
            .select({ userId: user_unique_id.user_id })
            .from(user_unique_id)
            .where(eq(user_unique_id.unique_id, data.data.user_unique_id));
          await db.insert(options_tread).select({
            //@ts-ignore
            symbol: data.data.symbol,
            user_id: userData?.userId,
            quantity: data.data.quantity,
            tread_type: data.data.type,
            open_price: data.data.price,
            take_profit: data.data.take_profit,
            stop_loss: data.data.stop_loss,
            tread_id: data.data.id,
            created_at: new Date(),
            updated_at: new Date(),
          });
        }

        get_consumer.commitOffsets([
          {
            topic: process.env.KAFKA_TOPIC!,
            partition: partition,
            offset: (Number(message.offset) + 1).toString(),
          },
        ]);
      },
    });
  }
}

new KafkaClient().consume_tread_history();

/*
       await db.insert(tread_history).values({
            stream: data.stream,
            e:data.data.e,
            E:data.data.E,
            s:data.data.s,
            p:data.data.p,
	        P:data.data.P,
	        w:data.data.w,
	        x:data.data.x,
	        c:data.data.c,
	        Q:data.data.Q,
	        b:data.data.b,
	        B:data.data.B,
	        a:data.data.a,
	        A:data.data.A,
	        o:data.data.o,
	        h:data.data.h,
	        l:data.data.l,
	        v:data.data.v,
	        q:data.data.q,
	        O:data.data.O,
	        C:data.data.C,
	        F:data.data.F,
	        L:data.data.L,
	        n:data.data.n,
            createdAt: new Date(),
            
        })

*/
