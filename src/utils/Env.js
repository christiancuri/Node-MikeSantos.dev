import logger from "./Logger";
import { Storage } from "@google-cloud/storage";
import fs from "fs";
import yaml from "yaml";

const storage = new Storage();

const Env = {
	BucketName: "mikesantos-env",
	async init() {
		const environment = process.env.ENVIRONMENT;

		const retry = (timeInMs, fileName) =>
			new Promise(resolve =>
				this.downloadEnv(fileName)
					.then(resolve)
					.catch(() => {
						logger.info(`Download Fail, retrying in ${ms / 1000}`);
						setTimeout(() => {
							logger.info("Retrying to get yml");
							retry(timeInMs, fileName).then(resolve);
						}, timeInMs);
					})
			);

		const processDownload = {
			development: () => true, // Local env
			PRODUCTION: () => retry(5000, "env.production.yml"), // process download from bucket file
			default: () => {
				throw new Error("Unknow environment");
			}
		};

		await (processDownload[environment] || processDownload.default)();
		return this.parseEnv();
	},

	downloadEnv(remoteFileName) {
		return storage
			.bucket(this.BucketName)
			.file(remoteFileName)
			.download({ destination: "env.yml" });
	},

	parseEnv() {
		const file = fs.readFileSync("./env.yml", "utf8");
		const env = yaml.parse(file);
		process.myEnv = env;
		return true;
	},

	get PORT() {
		return process.myEnv.PORT;
	}
};

export default Env;
