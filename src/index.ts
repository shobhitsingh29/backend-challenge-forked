import "reflect-metadata";
import express from "express";
import analysisRoutes from "./routes/analysisRoutes";
import workflowRoutes from "./routes/workflowRoutes";
import defaultRoute from "./routes/defaultRoute";
import { taskWorker } from "./workers/taskWorker";
import { AppDataSource } from "./data-source";
import { logger } from "./utils/Logger";

const app = express();
app.use(express.json());
app.use("/analysis", analysisRoutes);
app.use("/workflow", workflowRoutes);
app.use("/", defaultRoute);

let isShuttingDown = false;
let taskWorkerPromise: Promise<void> | null = null;

AppDataSource.initialize()
  .then(() => {
    logger.info("Database connected");

    taskWorkerPromise = taskWorker();

    const server = app.listen(3000, () => {
      logger.info("Server running at http://localhost:3000");
    });

    const gracefulShutdown = async (signal: string) => {
      if (isShuttingDown) return;
      isShuttingDown = true;

      logger.info(`Received ${signal}, starting graceful shutdown`);

      server.close(() => {
        logger.info("HTTP server closed");
      });

      await new Promise(resolve => setTimeout(resolve, 2000));
      logger.info("Graceful shutdown complete");
      process.exit(0);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  })
  .catch((error) => {
    logger.error("Failed to initialize database", error);
    process.exit(1);
  });
