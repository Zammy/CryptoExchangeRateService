import * as fs from "fs";

export class Config {
    public readonly currencyLayerAPIKey: string;
    public readonly port: number;
    public readonly cacheFolder: string;

    constructor() {
        console.log(process.cwd());
        let configString = fs.readFileSync('./config.json', { encoding: 'utf-8' });
        let jsonObj = JSON.parse(configString);
        this.currencyLayerAPIKey = jsonObj['currencyLayerAPIKey'] as string;
        this.port = jsonObj['port'] as number;
        this.cacheFolder = jsonObj['cacheFolder'] as string;
    }
}