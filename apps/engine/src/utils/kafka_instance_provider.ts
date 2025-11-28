import { Kafka, type Consumer, type Producer } from "kafkajs";
import { config } from "dotenv";
config();

class kafka_instance {
  private kafka: Kafka;
  private producer: Producer | undefined;
  private consumer: Consumer | undefined;
    
  constructor(KAFKA_CLIENT_ID: string, KAFKA_BROKER: string) {
    this.kafka = new Kafka({
      clientId: KAFKA_CLIENT_ID,
      brokers: [KAFKA_BROKER],
    });
  }
  public async kafka_producer() : Promise<Producer>{
    if (this.producer) return this.producer;
    this.producer = this.kafka.producer();
    await this.producer.connect();
    return this.producer;
  }
  public async kafka_consumer(groupId :string , topic : string) :Promise<Consumer>{
    if(this.consumer) return this.consumer;
    
    this.consumer = this.kafka.consumer({ groupId });
    this.consumer.subscribe({ topic:topic , fromBeginning: true });
    await this.consumer.connect();
    return this.consumer;
  }
}

export {kafka_instance}