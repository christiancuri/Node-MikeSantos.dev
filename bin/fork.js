import cluster from "cluster";
import os from "os";

const cpuCount = os.cpus().length;

const App = {
	init: async () => {
		process.myEnv = {
			customEnv: "Future"
		};
		return true;
	}
};

App.init().then(() => {
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
