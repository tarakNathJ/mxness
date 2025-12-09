import express from "express";
import { config } from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import route from "./routes/index.route.js";
import { PrometheusService } from "@express/monitoring";

config();

export const metrics = new PrometheusService();
class init_express_server {
  private app: express.Application = express();

  constructor() {
    this.app.use(express.json());
    this.app.use(cors({ origin: "*" }));
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));

    //////////////////// metrics //////////////////////////////
    this.app.use((req, res, next) => {
      const end = metrics.req_res_time.startTimer();
      res.on("finish", () => {
        end({
          method: req.method,
          route: req.route?.path || req.path,
          status_code: res.statusCode,
        });
      });
      next();
    });

    this.app.use("/api", route);

    this.app.get("/metrics", async (req, res) => {
      try {
        res.set("Content-Type", metrics.registry.contentType);
        const data = await metrics.registry.metrics();
        res.send(data);
      } catch (err: any) {
        res.status(500).send(`Error collecting metrics: ${err.message}`);
      }
    });
  }

  public start_server(PORT: number): any {
    const server = this.app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
    return server;
  }
}
export default init_express_server;
