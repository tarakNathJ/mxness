import promClient from "prom-client";
import { config } from "dotenv";
config();

class PrometheusService {
  public registry: promClient.Registry;

  // metrix
  public req_res_time: promClient.Histogram<string>;
  public ws_connections: promClient.Counter<string>;
  public ws_messages_received: promClient.Counter<string>;
  public ws_messages_sent: promClient.Counter<string>;
  public ws_active_connections: promClient.Gauge<string>;

  public trade_processing_duration: promClient.Histogram<string>;
  public kafka_messages_consumed: promClient.Counter<string>;
  public kafka_messages_produced: promClient.Counter<string>;
  public trade_tp_triggered: promClient.Counter<string>;
  public trade_sl_triggered: promClient.Counter<string>;
  public trade_hold: promClient.Counter<string>;

  constructor() {
    this.registry = new promClient.Registry();

    // Collect default metrics
    promClient.collectDefaultMetrics({ register: this.registry });

    //  HTTP Histogram
    this.req_res_time = new promClient.Histogram({
      name: "http_express_req_res_time",
      help: "HTTP request/response time",
      labelNames: ["method", "route", "status_code"],
      buckets: [1, 30, 50, 120, 200, 400, 500, 800, 1000, 2000],
    });

    // WebSocket Metrics
    this.ws_connections = new promClient.Counter({
      name: "ws_connections_total",
      help: "Total number of WebSocket connections",
    });

    this.ws_messages_received = new promClient.Counter({
      name: "ws_messages_received_total",
      help: "Total number of WebSocket messages received",
    });

    this.ws_messages_sent = new promClient.Counter({
      name: "ws_messages_sent_total",
      help: "Total number of WebSocket messages sent",
    });

    this.ws_active_connections = new promClient.Gauge({
      name: "ws_active_connections",
      help: "Number of active WebSocket connections",
    });


    // kafka
    this.trade_processing_duration = new promClient.Histogram({
      name: "trade_processing_duration_seconds",
      help: "Time taken to process a single trade event",
      buckets: [0.005, 0.01, 0.05, 0.1, 0.2, 0.5, 1],
    });
    this.kafka_messages_consumed = new promClient.Counter({
      name: "kafka_messages_consumed_total",
      help: "Total Kafka messages consumed",
    });
    this.kafka_messages_produced = new promClient.Counter({
      name: "kafka_messages_produced_total",
      help: "Total Kafka messages produced",
    });
    this.trade_tp_triggered = new promClient.Counter({
      name: "trade_take_profit_triggered_total",
      help: "Total number of TP triggers",
    });
    this.trade_sl_triggered = new promClient.Counter({
      name: "trade_stop_loss_triggered_total",
      help: "Total number of SL triggers",
    });
    this.trade_hold = new promClient.Counter({
      name: "trade_hold_total",
      help: "Trades kept on hold",
    });
    this.registry.registerMetric(this.req_res_time);
    this.registry.registerMetric(this.ws_connections);
    this.registry.registerMetric(this.ws_messages_received);
    this.registry.registerMetric(this.ws_messages_sent);
    this.registry.registerMetric(this.ws_active_connections);
    this.registry.registerMetric(this.trade_processing_duration);
    this.registry.registerMetric(this.kafka_messages_consumed);
    this.registry.registerMetric(this.kafka_messages_produced);
    this.registry.registerMetric(this.trade_tp_triggered);
    this.registry.registerMetric(this.trade_sl_triggered);
    this.registry.registerMetric(this.trade_hold);
  }

  public create_job_metrics(job_name: string) {
    if (!/^[a-zA-Z_:][a-zA-Z0-9_:]*$/.test(job_name)) {
      throw new Error(`Invalid job_name "${job_name}"`);
    }
    const job_registry = new promClient.Registry();
    const gateway = new promClient.Pushgateway(
      process.env.CLIENT_URL!,
      {},
      job_registry
    );

    const job_counter = new promClient.Counter({
      name: `${job_name}_runs_total`,
      help: `Total number of runs for job ${job_name}`,
      registers: [job_registry],
    });

    const job_duration = new promClient.Histogram({
      name: `${job_name}_duration_seconds`,
      help: `Duration of job ${job_name}`,
      registers: [job_registry],
      buckets: [0.1, 0.5, 1, 1.5, 2, 5, 10, 30],
    });

    return {
      job_counter,
      job_duration,
      push: async () => {
        try {
          await gateway.pushAdd({ jobName: job_name });
        } catch (error: any) {
          console.error("Failed to push metrics:", error.message);
        }
      },
    };
  }
}

export default PrometheusService;
