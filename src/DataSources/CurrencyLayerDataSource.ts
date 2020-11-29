import { IDataSource, CurrencyLayerJsonData } from ".";
import { HttpRequest } from "./HttpRequest";

const SUPPORTED_CURRENCIES = ["USD", "EUR", "BGN", "AFN", "AMD"];

export class CurrencyLayerDataSource implements IDataSource<CurrencyLayerJsonData> {

    constructor(private apiKey: string) { }

    async load(): Promise<CurrencyLayerJsonData> {
        let params: Map<string, any> = new Map([
            ['access_key', this.apiKey],
            ["currencies", SUPPORTED_CURRENCIES.join(',')],
            ['format', '1']
        ]);

        const rawData = await HttpRequest.get('http://api.currencylayer.com/live', params);
        const { success, timestamp, source, quotes } = JSON.parse(rawData);//TODO: error checking?
        const data = quotes as CurrencyLayerJsonData;

        console.log("Fetched latest from CurrencyLayerAPI");

        return Promise.resolve(data);
    }
}