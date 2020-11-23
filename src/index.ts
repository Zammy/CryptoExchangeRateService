import * as express from 'express';
import { HttpRequest } from "./HttpRequest";

const app = express.default();
const port = 3000; //should be passed as argument 
const currencyLayerAPIKey = "4e4e745ce8a809" + "cc91d6407c87fd1bca"; //should be passed through arguments
const SUPPORTED_CURRENCIES = ["USD", "EUR", "BGN", "AFN", "AMD"];

let currencyExchangeRatesFromUSD: { [index: string]: number } = {};
let currencyExchangeRates: {};

async function loadCurrencyExchangeRates() {
    let params: Map<string, any> = new Map([
        ['access_key', currencyLayerAPIKey],
        ["currencies", SUPPORTED_CURRENCIES.join(',')],
        ['format', '1']
    ]);

    const { success, timestamp, source, quotes } = await HttpRequest.get('http://api.currencylayer.com/live', params);

    for (let key in quotes) {
        currencyExchangeRatesFromUSD[key] = quotes[key];
    }
    // console.log(JSON.stringify(currencyExchangeRatesFromUSD));
}

async function loadCryptoExchangeRates() {
    currencyExchangeRates = await HttpRequest.get('https://api.coingecko.com/api/v3/exchange_rates');
}

// loadCurrencyExchangeRates().then(() => console.log("Successfully loaded fiat currencies from Currency Exchange"));
// loadCryptoExchangeRates().then(() => console.log("Successfully laoded crypto currencies exchange rates from CoinGecko"));

app.get('/exchange', (req, res) => {
    const query = req.query;
    const crypto = query["crypto"] as string;
    const fiat = query["fiat"] as string;
    let forceLatest: boolean = false;
    if (query["forceLatest"]) {
        forceLatest = (query["forceLatest"] as string).toLowerCase() == "true" ? true : false;
    }

    const exchangeRate = 1.241455;
    const lastUpdate = new Date();
    res.send({
        crypto, fiat, exchangeRate, lastUpdate
    });
});

app.listen(port, () => {
    console.log("Server is listening");
});
