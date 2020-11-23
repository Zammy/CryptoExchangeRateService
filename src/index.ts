import e, * as express from 'express';
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import { HttpRequest } from "./HttpRequest";

const app = express.default();
const port = 3000; //should be passed as argument 
const currencyLayerAPIKey = "4e4e745ce8a809" + "cc91d6407c87fd1bca"; //should be passed through arguments
const SUPPORTED_CURRENCIES = ["USD", "EUR", "BGN", "AFN", "AMD"];
const coingeckoFilename = "coingecko.json";
const currencyLayerFilename = "currency_layer.json";

let extraFiatCurrencyExchangeRatesFromUSD: {};
let currencyExchangeRates: {};


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
            currencyExchangeRates = cache;
            console.log(coingeckoFilename + " cache updated");
        }
    }, null);


loadCache(currencyLayerFilename)
    .then(cache => {
        if (cache) {
            currencyExchangeRates = cache;
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

    await persistCache(coingeckoFilename, JSON.stringify(currencyExchangeRates));
}

// loadCurrencyLayerAPI().then(() => console.log("Successfully loaded fiat currencies from Currency Layer " + new Date()));
loadCoingeckoAPI()
    .then(() => console.log("Successfully laoded crypto currencies exchange rates from CoinGecko " + new Date()))
    .finally(() => console.log("END"));



app.get('/exchange', async (req, res) => {
    const query = req.query;
    const crypto = query["crypto"] as string;
    const fiat = query["fiat"] as string;
    let forceLatest: boolean = false;
    if (query["forceLatest"]) {
        forceLatest = (query["forceLatest"] as string).toLowerCase() == "true" ? true : false;
    }


    const exchangeRate = 1.241455;

    const lastUpdate = new Date(); //store in-memory for now?
    res.send({
        crypto, fiat, exchangeRate, lastUpdate
    });
});

app.listen(port, () => {
    console.log("Server is listening");
});
