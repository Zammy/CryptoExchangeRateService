import * as fs from "fs";
import * as fsPromises from 'fs/promises';
import { IExchangeRateRepository } from "../Domain";
import { CoinGeckoRepository, CoinGeckoJsonData } from "./CoinGeckoRepository";
import { CurrencyExchageRepository, CurrencyExchageJsonData } from "./CurrencyExchageRepository";
import { HttpRequest } from "../HttpRequest";

const coingeckoFilename = "coingecko.json";
const currencyLayerFilename = "currency_layer.json";

const SUPPORTED_CURRENCIES = ["USD", "EUR", "BGN", "AFN", "AMD"];

export default class DataService {
    private coinGeckoRepo: CoinGeckoRepository;
    private currencyLayerRepo: CurrencyExchageRepository;
    private coinGeckoLastUpdate: Date;

    getLastUpdate(): Date {
        return this.coinGeckoLastUpdate;
    }

    constructor(private readonly cacheFolder: string, private readonly currencyLayerAPIKey: string, loadCache: boolean = true) {
        if (loadCache) {
            let cache = this.loadCache(coingeckoFilename);
            if (cache) {
                this.coinGeckoRepo = new CoinGeckoRepository(JSON.parse(cache) as CoinGeckoJsonData);
            }
            cache = this.loadCache(currencyLayerFilename);
            if (cache) {
                this.currencyLayerRepo = new CurrencyExchageRepository(JSON.parse(cache) as CurrencyExchageJsonData);
            }
        }
    }

    public sync() {
        //TODO: should reset auto sync interval on forced sync
        return Promise.all([this.loadFromCoinGeckoAPI(), this.loadFromCurrencyLayerAPI()]);
    }

    public getCryptoRepository(): IExchangeRateRepository {
        return this.coinGeckoRepo;
    }

    public getFiatRespository(): IExchangeRateRepository {
        return this.currencyLayerRepo;
    }

    private async loadFromCoinGeckoAPI() {
        let coinGecoData: CoinGeckoJsonData = await HttpRequest.get('https://api.coingecko.com/api/v3/exchange_rates');
        this.coinGeckoRepo = new CoinGeckoRepository(coinGecoData);
        this.coinGeckoLastUpdate = new Date();
        await this.persistCache(coingeckoFilename, JSON.stringify(coinGecoData));
        console.log("Fetched latest from CoinGeckoAPI " + Date.now);
    }

    private async loadFromCurrencyLayerAPI() {
        let params: Map<string, any> = new Map([
            ['access_key', this.currencyLayerAPIKey],
            ["currencies", SUPPORTED_CURRENCIES.join(',')],
            ['format', '1']
        ]);

        const { success, timestamp, source, quotes } = await HttpRequest.get('http://api.currencylayer.com/live', params);
        let currencyLayerData: CurrencyExchageJsonData = quotes;
        this.currencyLayerRepo = new CurrencyExchageRepository(currencyLayerData);
        await this.persistCache(currencyLayerFilename, JSON.stringify(quotes));
        console.log("Fetched latest from CurrencyLayerAPI " + Date.now);
    }

    private loadCache(cacheFileName: string): string {
        return fs.readFileSync(this.cacheFolder + cacheFileName, { encoding: "utf-8" });
    }

    private persistCache(cacheFileName: string, data: string): Promise<void> {
        return fsPromises.writeFile(this.cacheFolder + cacheFileName, data, { flag: 'w' })
            .catch((e: Error) => { console.error(e) });
    }
}