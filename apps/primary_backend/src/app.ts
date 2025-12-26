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
    // Trust proxy - IMPORTANT for getting correct client IPs behind nginx
    this.app.set("trust proxy", true);

    // CORS - Must be BEFORE body parsers
    this.app.use(
      cors({
        origin: function (origin, callback) {
          // Allow requests with no origin (like mobile apps, Postman, curl)
          if (!origin) return callback(null, true);

          const allowedOrigins = [
            "http://localhost:5173",
            "http://localhost:3000",
            "http://primary.taraknathjana.com",
            "http://publish.taraknathjana.com",
            "https://primary.taraknathjana.com",
            "https://publish.taraknathjana.com",
          ];

          if (allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            console.log(`CORS blocked origin: ${origin}`);
            callback(null, true); // Allow anyway for debugging
            // In production, use: callback(new Error('Not allowed by CORS'));
          }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allowedHeaders: [
          "Origin",
          "X-Requested-With",
          "Content-Type",
          "Accept",
          "Authorization",
          "X-Real-IP",
          "X-Forwarded-For",
          "X-Forwarded-Proto",
        ],
        exposedHeaders: ["Content-Range", "X-Content-Range"],
        maxAge: 3600, // Cache preflight for 1 hour
      })
    );
    this.app.use(express.json({ limit: "10mb" }));

    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

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

    // Health check endpoint - BEFORE routes
    this.app.get("/health", (req, res) => {
      res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      });
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
    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        error: "Not Found",
        path: req.path,
        method: req.method,
      });
    });

    // Global error handler
    this.app.use(
      (
        err: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        console.error("Error:", err);

        // Don't leak error details in production
        const isDevelopment = process.env.NODE_ENV !== "production";

        res.status(err.status || 500).json({
          error: isDevelopment ? err.message : "Internal Server Error",
          ...(isDevelopment && { stack: err.stack }),
          path: req.path,
          method: req.method,
        });
      }
    );
  }

  public start_server(PORT: number): any {
    const server = this.app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
   
    });

    // Graceful shutdown
    const gracefulShutdown = () => {
      
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        console.error("Forcing shutdown after timeout");
        process.exit(1);
      }, 30000);
    };

    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);

    // Handle uncaught errors
    process.on("uncaughtException", (err) => {
      console.error("Uncaught Exception:", err);
      gracefulShutdown();
    });

    process.on("unhandledRejection", (reason, promise) => {
      console.error("Unhandled Rejection at:", promise, "reason:", reason);
    });

    return server;
  }
}
export default init_express_server;

