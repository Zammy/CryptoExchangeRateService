import * as express from 'express';
import * as fsPromises from 'fs/promises';
import { HttpRequest } from "./HttpRequest";

const app = express.default();
const port = 3000; //should be passed as argument 
const currencyLayerAPIKey = "4e4e745ce8a809" + "cc91d6407c87fd1bca"; //should be passed through arguments
const SUPPORTED_CURRENCIES = ["USD", "EUR", "BGN", "AFN", "AMD"];
const coingeckoFilename = "coingecko.json";
const currencyLayerFilename = "currency_layer.json";

type MoneyType = 'crypto' | 'fiat';
interface jsObj { [key: string]: any };
interface RateInfo {
    "name": string,
    "unit": string,
    "value": number,
    "type": MoneyType
}

let extraFiatCurrencyExchangeRatesFromUSD: { [key: string]: number };
let currencyExchangeRates: { 'rates': { [key: string]: RateInfo } };
let lastUpdate = new Date();

function loadCache(cacheFileName: string): Promise<string | void> {
    return fsPromises.readFile('./cache/' + cacheFileName, { encoding: "utf-8" })
        .catch((e: Error) => { console.error(e) });
}

async function persistCache(cacheFileName: string, data: string): Promise<void> {
    fsPromises.writeFile('./cache/' + cacheFileName, data, { flag: 'w' })
        .catch((e: Error) => { console.error(e) });
}

loadCache(coingeckoFilename)
    .then(cache => {
        if (cache) {
            currencyExchangeRates = JSON.parse(cache);
            console.log(coingeckoFilename + " cache updated");
        }
    }, null);


loadCache(currencyLayerFilename)
    .then(cache => {
        if (cache) {
            extraFiatCurrencyExchangeRatesFromUSD = JSON.parse(cache);
            console.log(currencyLayerFilename + " cache updated");
        }
    }, null);


async function loadCurrencyLayerAPI() {
    let params: Map<string, any> = new Map([
        ['access_key', currencyLayerAPIKey],
        ["currencies", SUPPORTED_CURRENCIES.join(',')],
        ['format', '1']
    ]);


    const { success, timestamp, source, quotes } = await HttpRequest.get('http://api.currencylayer.com/live', params);
    extraFiatCurrencyExchangeRatesFromUSD = quotes;

    await persistCache(currencyLayerFilename, JSON.stringify(quotes));
}

async function loadCoingeckoAPI() {
    currencyExchangeRates = await HttpRequest.get('https://api.coingecko.com/api/v3/exchange_rates');
    lastUpdate = new Date();
    await persistCache(coingeckoFilename, JSON.stringify(currencyExchangeRates));
}

// loadCurrencyLayerAPI()
//     .catch(e => console.error(e))
//     .then(() => console.log("Successfully loaded fiat currencies from Currency Layer " + new Date()));

// loadCoingeckoAPI()
//     .catch(e => console.error(e))
//     .then(() => console.log("Successfully loaded crypto currencies exchange rates from CoinGecko " + new Date()));


app.get('/exchange', async (req, res) => {
    const query = req.query;
    const crypto = (query["crypto"] as string).toLocaleLowerCase();
    const fiat = (query["fiat"] as string).toLocaleLowerCase();
    let forceLatest: boolean = false;
    if (query["forceLatest"]) {
        forceLatest = (query["forceLatest"] as string).toLowerCase() == "true" ? true : false;
    }

    let exchangeRate: number = -1;

    //TODO: really? actually we need to validate crypto also if error we should error back through API
    let cryptoInfo: RateInfo = currencyExchangeRates.rates[crypto];

    let fiatInfo: RateInfo | undefined = currencyExchangeRates.rates[fiat];

    if (fiatInfo) {
        exchangeRate = fiatInfo.value / cryptoInfo.value;
    } else {
        let fiatInfoUsd = currencyExchangeRates.rates['usd'];

        let key = 'USD' + fiat.toUpperCase();
        let fiatExchangeRateToUSD = extraFiatCurrencyExchangeRatesFromUSD[key] as number;

        exchangeRate = fiatExchangeRateToUSD * fiatInfoUsd.value / cryptoInfo.value;
    }

    res.send({
        'crypto': crypto, 'fiat': fiat, 'exchangeRate': exchangeRate, 'lastUpdate': lastUpdate
    });
});

app.listen(port, () => {
    console.log("Server is listening");
});  