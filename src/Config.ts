import * as fs from "fs";

export class Config {
    public readonly currencyLayerAPIKey: string;
    public readonly port: number;
    public readonly syncInterval: number;
    public readonly syncOnStartup: boolean; //true by default
    public readonly cacheFolder?: string; //if cache folder in config run in cache mode

    constructor(input: string | any) {
        let jsonObj: any;
        if (typeof input == 'string') {
            let configString = fs.readFileSync(input, { encoding: 'utf-8' });
            jsonObj = JSON.parse(configString);
        } else {
            jsonObj = input;
        }
        this.currencyLayerAPIKey = jsonObj['currencyLayerAPIKey'] as string;
        this.port = jsonObj['port'] as number || 3000;
        this.cacheFolder = jsonObj['cacheFolder'] as string;
        this.syncInterval = jsonObj['syncInterval'] as number;
        let syncOnStartup = jsonObj['syncOnStartup'];
        this.syncOnStartup = syncOnStartup != undefined ? syncOnStartup as boolean : true;
    }
}