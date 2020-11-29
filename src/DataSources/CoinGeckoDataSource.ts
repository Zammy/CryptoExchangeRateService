import { IDataSource, CoinGeckoJsonData } from ".";
import { HttpRequest } from "./HttpRequest";

export class CoinGeckoDataSource implements IDataSource<CoinGeckoJsonData> {

    async load(): Promise<CoinGeckoJsonData> {
        const rawData = await HttpRequest.get('https://api.coingecko.com/api/v3/exchange_rates');
        const data = JSON.parse(rawData) as CoinGeckoJsonData;
        console.log("Fetched latest from CoinGeckoAPI");
        return Promise.resolve(data);
    }
}