import cluster from "cluster";
import os from "os";

import pack from "../package.json";
import { Env, logger } from "../src/utils";

const cpuCount = os.cpus().length;

Env.init().then(() => {
  logger.info(`Starting ${pack.name} v${pack.version} on port ${Env.PORT}`);

  cluster.setupMaster({ exec: "./bin/www" });

  const forkCluster = () => {
    const proc = cluster.fork();
    proc.send(process.myEnv);
  };

  if (process.env.ENVIRONMENT === "development") {
    forkCluster();
  } else {
    for (let i = 0; i < cpuCount; i++) {
      forkCluster();
    }
  }

  cluster.on("exit", (worker, code, signal) => {
    console.warn(
      `Worker: ${worker.process.pid} died with code: ${code}, and signal: ${signal}`
    );
    console.info("Starting a new worker");
    forkCluster();
  });
});
