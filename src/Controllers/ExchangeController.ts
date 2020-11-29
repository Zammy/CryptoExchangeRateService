import { Config } from "../Config";
import * as express from 'express';
import { Application } from "express";
import { CoinGeckoCacheDataSource, CoinGeckoDataSource, CurrencyLayerCacheDataSource, CurrencyLayerDataSource } from "../DataSources";
import { CoinGeckoRepository, CurrencyLayerRepository } from "../Repositories";
import { UseCases } from "../UseCases";

const coingeckoFilename = "coingecko.json";
const currencyLayerFilename = "currency_layer.json";

export class ExchangeController {
    private app: Application;
    private syncDate: Date;
    private coinGeckoRepo: CoinGeckoRepository;
    private currencyLayerRepo: CurrencyLayerRepository;

    getSyncDate(): Date {
        return this.syncDate;
    }

    constructor(private config: Config) {
        //TODO: should be injected?
        this.app = express.default();

        const coinGeckoCachePath = config.cacheFolder ? (config.cacheFolder + coingeckoFilename) : null;
        const coinGeckoCacheSource = coinGeckoCachePath ? new CoinGeckoCacheDataSource(coinGeckoCachePath) : undefined;
        const coinGeckoShouldUseCache = config.syncOnStartup ? undefined : coinGeckoCacheSource;
        this.coinGeckoRepo = new CoinGeckoRepository(new CoinGeckoDataSource(), coinGeckoCacheSource, coinGeckoShouldUseCache);

        const currencyLayerCachePath = config.cacheFolder ? (config.cacheFolder + currencyLayerFilename) : null;
        const currencyLayerCacheSource = currencyLayerCachePath ? new CurrencyLayerCacheDataSource(currencyLayerCachePath) : undefined;
        const currencyLayerShouldUseCache = config.syncOnStartup ? undefined : currencyLayerCacheSource;
        this.currencyLayerRepo = new CurrencyLayerRepository(new CurrencyLayerDataSource(config.currencyLayerAPIKey), currencyLayerCacheSource, currencyLayerShouldUseCache);

        this.setupRoute();
    }

    async init() {
        await this.sync();
    }

    listen() {
        this.app.listen(this.config.port, () => {
            console.log("Server is listening");
        });
    }

    private async sync(forceLatests?: boolean) {
        await UseCases.SynchronizeWithLatest(this.coinGeckoRepo, this.currencyLayerRepo, forceLatests);
        this.syncDate = new Date();
        console.log("SYNC!");
    }

    private setupRoute() {
        this.app.get('/exchange', async (req, res) => {
            const query = req.query;
            const crypto = (query["crypto"] as string).toLocaleLowerCase();
            const fiat = (query["fiat"] as string).toLocaleLowerCase();
            let forceLatest: boolean = false;
            if (query["forceLatest"]) {
                forceLatest = (query["forceLatest"] as string).toLowerCase() == "true" ? true : false;
            }

            if (forceLatest) {
                console.log("Forced latest");
                await this.sync(true);
            }

            let exchangeRate = UseCases.CalculateCryptoExchangeRate(
                this.coinGeckoRepo,
                this.currencyLayerRepo,
                crypto,
                fiat
            );
            const lastUpdate = this.syncDate;

            res.send({
                'crypto': crypto, 'fiat': fiat, 'exchangeRate': exchangeRate, 'lastUpdate': lastUpdate
            });
        });
    }
}