import * as express from 'express';
import { Config } from "./Config";
import DataService from './Data/DataServices';
import { UseCases, IExchangeRateRepository } from "./Domain";

const config = new Config();
const dataService = new DataService(config.cacheFolder, config.currencyLayerAPIKey);

(async function () {
    //TODO: initial sync, actuall should implement inside data source
    // await dataService.sync();

    const app = express.default();
    app.get('/exchange', async (req, res) => {
        const query = req.query;
        const crypto = (query["crypto"] as string).toLocaleLowerCase();
        const fiat = (query["fiat"] as string).toLocaleLowerCase();
        let forceLatest: boolean = false;
        if (query["forceLatest"]) {
            forceLatest = (query["forceLatest"] as string).toLowerCase() == "true" ? true : false;
        }

        if (forceLatest) {
            await dataService.sync();
        }

        let exchangeRate = UseCases.CalculateCryptoExchangeRate(
            dataService.getCryptoRepository(),
            dataService.getFiatRespository(),
            crypto,
            fiat
        );
        let lastUpdate = dataService.getLastUpdate();

        res.send({
            'crypto': crypto, 'fiat': fiat, 'exchangeRate': exchangeRate, 'lastUpdate': lastUpdate
        });
    });

    app.listen(config.port, () => {
        console.log("Server is listening");
    });
}());