import WebSocket from "ws";
import { Kafka, type Producer } from "kafkajs";
import { config } from "dotenv";
config();


class polling_binance_data {
  private binance_stream_url: string =
    "wss://stream.binance.com:9443/stream?streams=" +
    [
      "adausdt@ticker",
      "bnbusdt@ticker",
      "btcusdt@ticker",
      "ethusdt@ticker",
      "solusdt@ticker",
      "xrpusdt@ticker",
    ].join("/");

  private producer: Producer | undefined;

  constructor() {
    // connect to binance websocket
    const binance_ws = new WebSocket(this.binance_stream_url);
    binance_ws.on("open", () => {
      console.log("connection open ");
    });

    // listen all message and push in kafka  
    binance_ws.on("message", async (data) => {
      const row_to_json_from = JSON.parse(data.toString());

      const get_producer = await this.kafka_init_producer();
      get_producer.send({
        topic: process.env.KAFKA_TOPIC!,
        messages: [
          {
            value: JSON.stringify(row_to_json_from),
          },
        ],
      });
    });

    binance_ws.on("close", () => {
      console.log("connecton close ");
    });
  }

  // init producer
  private async kafka_init_producer(): Promise<Producer> {
    if (this.producer) return this.producer;
    const kafka_client_id = process.env.KAFKA_CLIENT_ID;
    const kafka_brocker = process.env.KAFKA_BROCKER;
    if (!kafka_client_id || !kafka_brocker) {
      throw new Error("kafka client id and kafka brocker are not exist");
    }

    const kafka = new Kafka({
      clientId: kafka_client_id,
      brokers: [kafka_brocker],
    });

    this.producer = kafka.producer();
    await this.producer.connect();

    return this.producer;
  }
}

new polling_binance_data();
