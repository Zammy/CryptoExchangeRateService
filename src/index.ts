import * as express from 'express';

import { Config } from "./Config";
import { ExchangeController } from "./Controllers/ExchangeController";
import { CoinGeckoCacheDataSource, CoinGeckoDataSource, CurrencyLayerCacheDataSource, CurrencyLayerDataSource } from "./DataSources";
import { CoinGeckoRepository, CurrencyLayerRepository } from "./Repositories";

const config = new Config('./config.json');


const coingeckoFilename = "coingecko.json";
const currencyLayerFilename = "currency_layer.json";

const coinGeckoCachePath = config.cacheFolder ? (config.cacheFolder + coingeckoFilename) : null;
const coinGeckoCacheSource = coinGeckoCachePath ? new CoinGeckoCacheDataSource(coinGeckoCachePath) : undefined;
const coinGeckoShouldUseCache = config.syncOnStartup ? undefined : coinGeckoCacheSource;
const coinGeckoRepo = new CoinGeckoRepository(new CoinGeckoDataSource(), coinGeckoCacheSource, coinGeckoShouldUseCache);

const currencyLayerCachePath = config.cacheFolder ? (config.cacheFolder + currencyLayerFilename) : null;
const currencyLayerCacheSource = currencyLayerCachePath ? new CurrencyLayerCacheDataSource(currencyLayerCachePath) : undefined;
const currencyLayerShouldUseCache = config.syncOnStartup ? undefined : currencyLayerCacheSource;
const currencyLayerRepo = new CurrencyLayerRepository(new CurrencyLayerDataSource(config.currencyLayerAPIKey), currencyLayerCacheSource, currencyLayerShouldUseCache);


(async function () {
    const controller = new ExchangeController(config, express.default(), coinGeckoRepo, currencyLayerRepo);
    await controller.init();
    controller.listen();
}());

