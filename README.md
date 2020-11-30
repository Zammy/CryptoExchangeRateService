# Crypto to Fiat currency exchange rate web service using CoinGecko and CurrencyLayer


## Requirements

Build and tested with nodejs version v15.3.0. <br />
TypeScript used exclusively. <br />
All source code is in `src` folder.  <br />
Built javascript files in `build` folder. <br />

## Installation

* `npm install` - to get all packages needed
* `npm run compile` - to build package
* `npm run compile:clean` - to build package with removing previous build
* `npm run compile:run` - to build package and then run web service
* `npm run run` - to run web service
* `npm run test` - to test package
* `npm run test:compile` - to build and the test package

## Config

Before running web service a config file must be created in root folder of project named `config.json`.
```
{
    "currencyLayerAPIKey" : //currency layer api key,
    "port" : 3000 //port on which to listen for HTTP request, 3000 is default,
    "cacheFolder" : //path to cache folder, no caching by default,
    "syncInterval : //scheduled regural syncs with APIs in milliseconds
    "syncOnStartup" : true // true by default, it does sync with APIs on service startup
}
```
`currencyLayerAPIKey` is only required option.

## API

Service creates only one route `/exchange` that answers on GET requests.
It accepts three parameters:
 *   **crypto**: currency code of crypto currency
 *   **fiat**: currency code of fiat currency
 *   **forceLatest**: to force a sync with APIs to get latest data

Example request `http:localhost:3000/exchange?crypto=btc&fiat=usd&forceLatest=true`

Returns JSON as result and code 200 if parameters were correct:
```
{
    'success': true, 
    'crypto': 'btc', // currency code of crypto currency
    'fiat': 'usd, //currency code of fiat currency
     'exchangeRate': 20000 //actual exchange rate fiat -> crypto. How much fiat is needed to buy one of crypto
     'lastUpdate': 2020-11-30T10:25:02.154Z // Serialized Date of object of last sync with services
}
```

If crypto of fiat currency not supported 400 code is returned with error:
```
{
    "success": false,
    "error": "Crypto currency xxx is not supported."
}
```
and with fiat currency
```
{
    "success": false,
    "error": "Fiat currency lsl is not supported."
}
```

## Supported fiat currencies

All CoinGecko crypto and fiat currencies are supported: `https://www.coingecko.com/en/api` 
Added extra supported currencies with help of Currency Layer:
* BGN - Bulgarian Lev
* AFN - Afghan afghani
* AMD - Armenian dram